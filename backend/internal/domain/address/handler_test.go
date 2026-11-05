package address

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestAddressDefaultAcceptsFEBooleanAndNumber(t *testing.T) {
	for _, testCase := range []struct {
		input string
		want  bool
	}{{"true", true}, {"false", false}, {"1", true}, {"0", false}} {
		var value requestBoolean
		if err := json.Unmarshal([]byte(testCase.input), &value); err != nil {
			t.Fatalf("unmarshal %s: %v", testCase.input, err)
		}
		if bool(value) != testCase.want {
			t.Errorf("value for %s=%v want %v", testCase.input, value, testCase.want)
		}
	}
	var invalid requestBoolean
	if err := json.Unmarshal([]byte("2"), &invalid); err == nil {
		t.Fatal("address default accepted a numeric value outside 0/1")
	}
	if err := json.Unmarshal([]byte(`"true"`), &invalid); err == nil {
		t.Fatal("address default accepted a string")
	}
}

func TestAddressInputValidation(t *testing.T) {
	request := addressRequest{
		RecipientName: "Nguyen Van A",
		Phone:         "+84901234567",
		Province:      "Ha Noi",
		District:      "Cau Giay",
		Ward:          "Dich Vong",
		StreetDetail:  "12 Duy Tan",
		AddressType:   "office",
	}
	recorder := httptest.NewRecorder()
	if !validateAddressRequest(recorder, &request) {
		t.Fatalf("valid address rejected: %s", recorder.Body.String())
	}
	if request.AddressType != "OFFICE" {
		t.Fatalf("address_type=%q want OFFICE", request.AddressType)
	}
	request.Phone = "not-a-phone"
	recorder = httptest.NewRecorder()
	if validateAddressRequest(recorder, &request) || recorder.Code != http.StatusBadRequest {
		t.Fatalf("invalid phone was not rejected with 400: status=%d", recorder.Code)
	}
}
