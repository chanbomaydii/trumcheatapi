package service

import "testing"

func TestUserRoleCapabilities(t *testing.T) {
	tests := []struct {
		name        string
		role        string
		admin       bool
		root        bool
		reseller    bool
		panelAccess bool
	}{
		{name: "root", role: RoleRoot, admin: true, root: true, panelAccess: true},
		{name: "admin", role: RoleAdmin, admin: true, panelAccess: true},
		{name: "reseller", role: RoleReseller, reseller: true},
		{name: "user", role: RoleUser},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			user := &User{Role: test.role}
			if got := user.IsAdmin(); got != test.admin {
				t.Fatalf("IsAdmin() = %v, want %v", got, test.admin)
			}
			if got := user.IsRoot(); got != test.root {
				t.Fatalf("IsRoot() = %v, want %v", got, test.root)
			}
			if got := user.IsReseller(); got != test.reseller {
				t.Fatalf("IsReseller() = %v, want %v", got, test.reseller)
			}
			if got := user.CanAccessAdminPanel(); got != test.panelAccess {
				t.Fatalf("CanAccessAdminPanel() = %v, want %v", got, test.panelAccess)
			}
		})
	}
}
