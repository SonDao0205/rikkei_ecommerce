package auth

import (
	"net/http/httptest"
	"testing"
)

func TestValidateAdminUserRequest(t *testing.T) {
	tests := []struct {
		name string
		in   adminUserRequest
		new  bool
		want bool
	}{
		{name: "valid create", in: adminUserRequest{FullName: "Test User", Email: "test@example.test", Phone: "0912345678", Password: "StrongPass123"}, new: true, want: true},
		{name: "invalid email", in: adminUserRequest{FullName: "Test User", Email: "bad", Phone: "0912345678", Password: "StrongPass123"}, new: true},
		{name: "weak password", in: adminUserRequest{FullName: "Test User", Email: "test@example.test", Phone: "0912345678", Password: "weak"}, new: true},
		{name: "valid update without password", in: adminUserRequest{FullName: "Test User", Email: "test@example.test", Phone: "0912345678"}, want: true},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			got := validateAdminUserRequest(recorder, &test.in, test.new)
			if got != test.want {
				t.Fatalf("valid=%v want=%v response=%s", got, test.want, recorder.Body.String())
			}
		})
	}
}

func TestNormalizeAdminRolesProtectsAdminAndRequiresClient(t *testing.T) {
	tests := []struct {
		roles []string
		want  bool
	}{{[]string{"client"}, true}, {[]string{"CLIENT", "SELLER"}, true}, {[]string{"ADMIN"}, false}, {[]string{"SELLER"}, false}}
	for _, test := range tests {
		recorder := httptest.NewRecorder()
		_, got := normalizeAdminRoles(recorder, test.roles)
		if got != test.want {
			t.Fatalf("roles=%v accepted=%v want %v body=%s", test.roles, got, test.want, recorder.Body.String())
		}
	}
}
