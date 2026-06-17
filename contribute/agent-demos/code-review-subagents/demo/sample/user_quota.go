// Package quotademo is sample code for the code-review subagent demo.
// It is NOT production code — it intentionally contains review targets.
package quotademo

import (
	"context"
	"database/sql"
	"fmt"
)

const defaultQuota = 100

// UserQuota tracks per-user usage against a limit.
type UserQuota struct {
	UserID string
	Limit  int
	Used   int
}

// GetUserQuota loads quota for a user. DEMO: string-built SQL and ignored Close error.
func GetUserQuota(ctx context.Context, db *sql.DB, userID string) (*UserQuota, error) {
	query := "SELECT user_id, quota_limit, quota_used FROM user_quota WHERE user_id = '" + userID + "'"
	rows, err := db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	rows.Close() // DEMO: should check error and use defer

	var q UserQuota
	if rows.Next() {
		if err := rows.Scan(&q.UserID, &q.Limit, &q.Used); err != nil {
			return nil, err
		}
	}
	return &q, nil
}

// CanConsume returns whether the user may consume amount units.
func CanConsume(q *UserQuota, amount int) bool {
	if q == nil {
		return false
	}
	remaining := q.Limit - q.Used
	if remaining < amount {
		return false
	}
	return true
}

// ApplyUsage increments used count. DEMO: no validation, silent no-op on nil.
func ApplyUsage(q *UserQuota, amount int) {
	if q == nil {
		return
	}
	q.Used = q.Used + amount
}

// FormatStatus returns a human-readable status string.
func FormatStatus(q *UserQuota) string {
	if q == nil {
		return "unknown"
	}
	pct := (q.Used * 100) / q.Limit // DEMO: divide by zero if Limit is 0
	return fmt.Sprintf("%s: %d/%d (%d%%)", q.UserID, q.Used, q.Limit, pct)
}

// MergeQuota picks the higher limit between two records. DEMO: duplicated max logic.
func MergeQuota(a, b *UserQuota) *UserQuota {
	if a == nil && b == nil {
		return nil
	}
	if a == nil {
		return b
	}
	if b == nil {
		return a
	}
	limit := a.Limit
	if b.Limit > limit {
		limit = b.Limit
	}
	used := a.Used
	if b.Used > used {
		used = b.Used
	}
	return &UserQuota{UserID: a.UserID, Limit: limit, Used: used}
}
