package repository

import (
	"time"

	provisioning "github.com/grafana/grafana/apps/provisioning/pkg/apis/provisioning/v0alpha1"
)

// WebhookStatusPatches returns the JSON patch operations that persist a freshly
// created or rotated provider webhook: its status and secret.
func WebhookStatusPatches(id int64, url string, events []string, secret string) []map[string]any {
	return []map[string]any{
		{
			"op":   "replace",
			"path": "/status/webhook",
			"value": &provisioning.WebhookStatus{
				ID:               id,
				URL:              url,
				SubscribedEvents: events,
				LastRotated:      time.Now().UnixMilli(),
			},
		},
		{
			"op":   "replace",
			"path": "/secure/webhookSecret",
			"value": map[string]string{
				"create": secret,
			},
		},
	}
}

// ClearWebhookStatusPatch returns the JSON patch operation that clears the
// webhook status, e.g. after the remote webhook has been deleted.
func ClearWebhookStatusPatch() []map[string]any {
	return []map[string]any{{
		"op":    "replace",
		"path":  "/status/webhook",
		"value": nil,
	}}
}
