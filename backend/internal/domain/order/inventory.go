package order

import (
	"context"
	"database/sql"
)

// RestoreShopOrderInventory releases the inventory reserved by checkout.
// The caller locks the shop order and applies its cancellation in the same transaction.
func RestoreShopOrderInventory(ctx context.Context, tx *sql.Tx, shopOrderID int64) error {
	rows, err := tx.QueryContext(ctx,
		`SELECT variant_id, product_id, quantity, flash_sale_id FROM order_items WHERE shop_order_id = ? ORDER BY variant_id FOR UPDATE`, shopOrderID)
	if err != nil {
		return err
	}
	defer rows.Close()

	type item struct {
		variantID, productID, quantity int64
		flashSaleID                    sql.NullInt64
	}
	var items []item
	for rows.Next() {
		var entry item
		if err := rows.Scan(&entry.variantID, &entry.productID, &entry.quantity, &entry.flashSaleID); err != nil {
			return err
		}
		items = append(items, entry)
	}
	if err := rows.Err(); err != nil {
		return err
	}
	for _, entry := range items {
		if _, err := tx.ExecContext(ctx, `UPDATE product_variants SET stock = stock + ? WHERE id = ?`, entry.quantity, entry.variantID); err != nil {
			return err
		}
		if _, err := tx.ExecContext(ctx, `UPDATE products SET sold_count = sold_count - LEAST(sold_count, ?) WHERE id = ?`, entry.quantity, entry.productID); err != nil {
			return err
		}
		if entry.flashSaleID.Valid {
			if _, err := tx.ExecContext(ctx, `UPDATE flash_sales SET quantity_sold = quantity_sold - LEAST(quantity_sold, ?) WHERE id = ?`, entry.quantity, entry.flashSaleID.Int64); err != nil {
				return err
			}
		}
	}
	return nil
}
