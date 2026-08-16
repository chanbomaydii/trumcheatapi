package service

// Task 4 appends fakeStatusRepo here and will add "sync/atomic" and "time".
import (
	"context"
	"errors"
	"testing"
)

type stubSettingRepo struct {
	SettingRepository
	vals map[string]string
	err  error
}

func (s *stubSettingRepo) GetMultiple(_ context.Context, keys []string) (map[string]string, error) {
	if s.err != nil {
		return nil, s.err
	}
	out := make(map[string]string, len(keys))
	for _, k := range keys {
		out[k] = s.vals[k]
	}
	return out, nil
}

func TestGetPublicStatusRuntime_EnabledWhenTrue(t *testing.T) {
	s := &SettingService{settingRepo: &stubSettingRepo{vals: map[string]string{
		SettingKeyPublicStatusEnabled: "true",
	}}}
	if got := s.GetPublicStatusRuntime(context.Background()); !got.Enabled {
		t.Fatalf("want Enabled=true, got %+v", got)
	}
}

func TestGetPublicStatusRuntime_FailClosedOnRepoError(t *testing.T) {
	s := &SettingService{settingRepo: &stubSettingRepo{err: errors.New("db down")}}
	if got := s.GetPublicStatusRuntime(context.Background()); got.Enabled {
		t.Fatalf("want fail-closed Enabled=false, got %+v", got)
	}
}

func TestGetPublicStatusRuntime_DisabledWhenUnset(t *testing.T) {
	s := &SettingService{settingRepo: &stubSettingRepo{vals: map[string]string{}}}
	if got := s.GetPublicStatusRuntime(context.Background()); got.Enabled {
		t.Fatalf("want Enabled=false when key missing, got %+v", got)
	}
}
