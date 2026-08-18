CREATE UNIQUE INDEX IF NOT EXISTS payment_orders_provider_instance_trade_no_key
    ON payment_orders(provider_instance_id, payment_trade_no)
        WHERE provider_key = 'rpay_mbbank'
            AND provider_instance_id IS NOT NULL
            AND payment_trade_no <> '';