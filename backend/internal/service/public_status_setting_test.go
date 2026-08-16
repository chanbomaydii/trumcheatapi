package service

import (
	"context"
	"testing"

	"github.com/Wei-Shaw/sub2api/internal/config"
)

// recordingSettingRepo captures whatever the write path emits and serves it
// back on reads, so a test can follow one value all the way from an admin
// SystemSettings field to GetPublicStatusRuntime without a database.
type recordingSettingRepo struct {
	SettingRepository
	stored map[string]string
}

func newRecordingSettingRepo() *recordingSettingRepo {
	return &recordingSettingRepo{stored: map[string]string{}}
}

func (r *recordingSettingRepo) GetValue(_ context.Context, _ string) (string, error) {
	// Pretend the settings table is empty so InitializeDefaultSettings runs.
	return "", ErrSettingNotFound
}

func (r *recordingSettingRepo) SetMultiple(_ context.Context, settings map[string]string) error {
	for k, v := range settings {
		r.stored[k] = v
	}
	return nil
}

func (r *recordingSettingRepo) GetMultiple(_ context.Context, keys []string) (map[string]string, error) {
	out := make(map[string]string, len(keys))
	for _, k := range keys {
		out[k] = r.stored[k]
	}
	return out, nil
}

// A fresh deployment must have the switch present and OFF. "Present" matters as
// much as "off": without a seeded default the key never appears in the settings
// table, and an operator toggling it in the admin UI would be creating it blind.
func TestInitializeDefaultSettings_SeedsPublicStatusDisabled(t *testing.T) {
	repo := newRecordingSettingRepo()
	s := &SettingService{settingRepo: repo, cfg: &config.Config{}}

	if err := s.InitializeDefaultSettings(context.Background()); err != nil {
		t.Fatalf("InitializeDefaultSettings: %v", err)
	}

	got, ok := repo.stored[SettingKeyPublicStatusEnabled]
	if !ok {
		t.Fatalf("%s missing from the seeded defaults", SettingKeyPublicStatusEnabled)
	}
	if got != "false" {
		t.Fatalf("want the opt-in default %q, got %q", "false", got)
	}

	// Fail-closed property preserved end to end on a fresh install.
	if rt := s.GetPublicStatusRuntime(context.Background()); rt.Enabled {
		t.Fatalf("want the endpoint disabled on a fresh install, got %+v", rt)
	}
}

// The critical hop: an admin write of SystemSettings.PublicStatusEnabled must
// land in the settings store under the exact key and exact string value that
// GetPublicStatusRuntime tests for. Anything else (a bool, "True", "1") leaves
// the endpoint 404ing while the admin UI shows the switch as on.
func TestBuildSystemSettingsUpdates_WritesPublicStatusSwitch(t *testing.T) {
	repo := newRecordingSettingRepo()
	s := &SettingService{settingRepo: repo}

	updates, err := s.buildSystemSettingsUpdates(context.Background(), &SystemSettings{PublicStatusEnabled: true})
	if err != nil {
		t.Fatalf("buildSystemSettingsUpdates: %v", err)
	}
	if got := updates[SettingKeyPublicStatusEnabled]; got != "true" {
		t.Fatalf("want %s=%q, got %q", SettingKeyPublicStatusEnabled, "true", got)
	}

	// Feed the write path's own output into the read path.
	if err := repo.SetMultiple(context.Background(), updates); err != nil {
		t.Fatalf("SetMultiple: %v", err)
	}
	if rt := s.GetPublicStatusRuntime(context.Background()); !rt.Enabled {
		t.Fatalf("want the endpoint enabled after an admin write, got %+v", rt)
	}

	// And back off again — the switch must be reversible, not one-way.
	offUpdates, err := s.buildSystemSettingsUpdates(context.Background(), &SystemSettings{PublicStatusEnabled: false})
	if err != nil {
		t.Fatalf("buildSystemSettingsUpdates(off): %v", err)
	}
	if got := offUpdates[SettingKeyPublicStatusEnabled]; got != "false" {
		t.Fatalf("want %s=%q, got %q", SettingKeyPublicStatusEnabled, "false", got)
	}
	if err := repo.SetMultiple(context.Background(), offUpdates); err != nil {
		t.Fatalf("SetMultiple(off): %v", err)
	}
	if rt := s.GetPublicStatusRuntime(context.Background()); rt.Enabled {
		t.Fatalf("want the endpoint disabled after switching off, got %+v", rt)
	}
}

// parseSettings is what populates the SystemSettings the admin GET returns, so
// the admin UI's toggle reflects the stored value rather than always showing off.
func TestParseSettings_ReadsPublicStatusSwitchStrictly(t *testing.T) {
	s := &SettingService{cfg: &config.Config{}}

	if got := s.parseSettings(map[string]string{SettingKeyPublicStatusEnabled: "true"}); !got.PublicStatusEnabled {
		t.Fatalf(`want PublicStatusEnabled=true for "true"`)
	}
	for _, raw := range []string{"", "false", "1", "TRUE", "yes"} {
		if got := s.parseSettings(map[string]string{SettingKeyPublicStatusEnabled: raw}); got.PublicStatusEnabled {
			t.Fatalf("want PublicStatusEnabled=false for %q (strict-true only)", raw)
		}
	}
}

// The public settings projection is what the browser reads; the landing page
// uses it to decide whether asking /public/status is worth a request at all.
func TestGetPublicSettings_ExposesPublicStatusSwitch(t *testing.T) {
	repo := newRecordingSettingRepo()
	repo.stored[SettingKeyPublicStatusEnabled] = "true"
	s := &SettingService{settingRepo: repo}

	got, err := s.GetPublicSettings(context.Background())
	if err != nil {
		t.Fatalf("GetPublicSettings: %v", err)
	}
	if !got.PublicStatusEnabled {
		t.Fatalf("want public_status_enabled exposed as true, got %+v", got.PublicStatusEnabled)
	}
}
