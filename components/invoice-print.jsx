"use client";

import { shortDate } from "@/lib/utils";

export function InvoicePrint({ order }) {
  const billing = order?.billing || {};
  const items = order?.lineItems || order?.items || [];

  const customerName =
    order?.customer?.name ||
    [billing.firstName, billing.lastName].filter(Boolean).join(" ") ||
    "Customer";

  const subtotal = Number(order?.subtotal) || 0;
  const shipping = Number(order?.shippingFee || order?.shipping) || 0;
  const discount = Number(order?.discount) || 0;

  const total =
    Number(order?.total) || subtotal + shipping - discount;

  const currencyCode = String(
    order?.currency || order?.paymentCurrency || "USD"
  ).toUpperCase();

  const formatMoney = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(Number(value) || 0);

  const qty = (item) =>
    Math.max(1, Math.round(Number(item?.quantity) || 1));

  const itemImage = (item) =>
    item?.image ||
    item?.productImage ||
    item?.thumbnail ||
    item?.imageUrl ||
    "";

  const itemName = (item) =>
    item?.name ||
    item?.productName ||
    item?.title ||
    item?.productId ||
    item?.ingramPartNumber ||
    "Product";

  const itemSku =
    (item) =>
      item?.productId ||
      item?.ingramPartNumber ||
      item?.sku ||
      item?.partNumber ||
      "—";

  return (
    <div className="invoice-print-root hidden print:block">
      <div className="invoice-print-page">
        {/* =========================
            HEADER
        ========================== */}
        <header className="invoice-header">
          <div className="invoice-brand">
            <div className="brand-content">
              <div className="brand-wordmark">
                ZoeLit
              </div>

              <div className="brand-name">
                <span>Commerce</span> Invoice
              </div>

              <div className="company-contact">support@zoelit.com</div>
              <div className="company-contact company-line">ZoeLit Commerce</div>
            </div>
          </div>

          <div className="invoice-heading">
            <div className="invoice-title">
              INVOICE
            </div>

            <div className="invoice-number">
              #{order?.orderNumber || "—"}
            </div>

            <div className="invoice-meta invoice-meta-grid">
              <div>
                <span>Invoice Number</span>
                <strong>#{order?.orderNumber || "—"}</strong>
              </div>

              <div>
                <span>Invoice Date</span>
                <strong>{order?.date ? shortDate(order.date) : "—"}</strong>
              </div>

              <div>
                <span>Order Status</span>
                <strong>{order?.status || "Processing"}</strong>
              </div>

              <div>
                <span>Payment Status</span>
                <strong>{order?.payment || "Paid"}</strong>
              </div>
            </div>
          </div>
        </header>

        {/* =========================
            STATUS BAR
        ========================== */}
        <section className="status-bar">
          <div className="status-item">
            <span>Status</span>
            <strong>{order?.status || "Processing"}</strong>
          </div>

          <div className="status-item">
            <span>Payment</span>
            <strong>{order?.payment || "Paid"}</strong>
          </div>

          <div className="status-item">
            <span>Tracking</span>
            <strong>{order?.tracking || "—"}</strong>
          </div>

          <div className="status-item">
            <span>Carrier</span>
            <strong>{order?.carrierName || "—"}</strong>
          </div>
        </section>

        {/* =========================
            INFORMATION
        ========================== */}
        <section className="information-section">
          {/* Billing */}
          <div className="information-column">
            <div className="section-label">
              BILLING INFORMATION
            </div>

            <div className="customer-name">
              {customerName}
            </div>

            <div className="address">
              {billing.address && (
                <div>{billing.address}</div>
              )}

              {[
                billing.city,
                billing.state,
                billing.postal,
              ].filter(Boolean).length > 0 && (
                <div>
                  {[
                    billing.city,
                    billing.state,
                    billing.postal,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}

              {billing.country && (
                <div>{billing.country}</div>
              )}
            </div>

            {(billing.email || billing.phone) && (
              <div className="contact-details">
                {billing.email && (
                  <div>{billing.email}</div>
                )}

                {billing.phone && (
                  <div>{billing.phone}</div>
                )}
              </div>
            )}
          </div>

          {/* Order */}
          <div className="information-column order-column">
            <div className="section-label">
              ORDER INFORMATION
            </div>

            <div className="order-details">
              <div>
                <span>Ordered</span>
                <strong>
                  {order?.date
                    ? shortDate(order.date)
                    : "—"}
                </strong>
              </div>

              {order?.ingramOrderNumber && (
                <div>
                  <span>Ingram Ref</span>
                  <strong>
                    {order.ingramOrderNumber}
                  </strong>
                </div>
              )}

              {order?.invoiceNumber && (
                <div>
                  <span>Invoice #</span>
                  <strong>
                    {order.invoiceNumber}
                  </strong>
                </div>
              )}

              {order?.tracking && (
                <div>
                  <span>Tracking</span>
                  <strong>{order.tracking}</strong>
                </div>
              )}

              {order?.carrierName && (
                <div>
                  <span>Carrier</span>
                  <strong>{order.carrierName}</strong>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =========================
            PRODUCTS
        ========================== */}
        <section className="products-section">
          <div className="products-heading">
            <div className="product-heading-name">
              PRODUCT
            </div>

            <div className="product-heading-sku">
              SKU
            </div>

            <div className="product-heading-qty">
              QTY
            </div>

            <div className="product-heading-price">
              UNIT PRICE
            </div>

            <div className="product-heading-total">
              TOTAL
            </div>
          </div>

          <div className="products-body">
            {items.length > 0 ? (
              items.map((item, index) => {
                const image = itemImage(item);
                const quantity = qty(item);
                const price = Number(item?.price) || 0;
                const lineTotal = price * quantity;

                return (
                  <div
                    className="product-row"
                    key={
                      item?.productId ||
                      item?._id ||
                      item?.ingramPartNumber ||
                      index
                    }
                  >
                    {/* Product */}
                    <div className="product-info">
                      <div className="product-image">
                        {image ? (
                          <img
                            src={image}
                            alt={itemName(item)}
                            loading="eager"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="product-image-element"
                          />
                        ) : (
                          <div className="no-image">
                            Z
                          </div>
                        )}
                      </div>

                      <div className="product-name-wrapper">
                        <div className="product-name">
                          {itemName(item)}
                        </div>
                      </div>
                    </div>

                    {/* SKU */}
                    <div className="product-sku">
                      {itemSku(item)}
                    </div>

                    {/* Quantity */}
                    <div className="product-qty">
                      {quantity}
                    </div>

                    {/* Unit */}
                    <div className="product-price">
                      {formatMoney(price)}
                    </div>

                    {/* Total */}
                    <div className="product-total">
                      {formatMoney(lineTotal)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-products">
                No products found
              </div>
            )}
          </div>
        </section>

        {/* =========================
            BOTTOM AREA
        ========================== */}
        <section className="bottom-section">
          <div className="thank-you-area">
            <div className="thank-you-title">
              Thank you for your order
            </div>

            <div className="thank-you-text">
              We appreciate your business with ZoeLit.
              Your order has been received and is being
              processed.
            </div>
          </div>

          {/* Totals */}
          <div className="totals-section">
            <div className="total-row">
              <span>Cart Subtotal</span>
              <strong>
                {formatMoney(subtotal)}
              </strong>
            </div>

            <div className="total-row">
              <span>Shipping</span>
              <strong>
                {formatMoney(shipping)}
              </strong>
            </div>

            <div className="total-row">
              <span>Discount</span>
              <strong>
                {formatMoney(discount)}
              </strong>
            </div>

            <div className="total-divider" />

            <div className="grand-total">
              <span>Total Order</span>

              <strong>
                {formatMoney(total)}
              </strong>
            </div>
          </div>
        </section>

        {/* =========================
            FOOTER
        ========================== */}
        <footer className="invoice-footer">
          <div className="footer-branding">ZoeLit Commerce</div>
          <div className="footer-center">
            <div className="footer-thanks">Thank you for your order with ZoeLit</div>
            <div>This invoice was generated automatically.</div>
            <div>For order queries contact support@zoelit.com</div>
          </div>
          <div className="footer-support">support@zoelit.com</div>
        </footer>
      </div>

      {/* =========================
          PRINT STYLES
      ========================== */}
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 12mm;
        }

        * {
          box-sizing: border-box;
        }

        .invoice-print-root {
          width: 100%;
          background: white;
          color: #0f172a;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .invoice-print-page {
          width: 186mm;
          min-height: 273mm;
          margin: 0 auto;
          padding: 4mm 5mm 4mm 5mm;
          background: white;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* =========================
           HEADER
        ========================== */

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 7mm;
          border-bottom: 1.5px solid #0f172a;
        }

        .invoice-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .brand-content {
          min-width: 0;
        }

        .brand-wordmark {
          font-size: 11px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: 2.8px;
          text-transform: uppercase;
          color: #1457d9;
        }

        .brand-name {
          margin-top: 4px;
          font-size: 26px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -1.2px;
          color: #111827;
        }

        .brand-name span {
          color: #1457d9;
        }

        .company-line {
          margin-top: 2px;
        }

        .company-contact {
          margin-top: 5px;
          font-size: 9px;
          color: #64748b;
        }

        .invoice-heading {
          text-align: right;
          min-width: 145px;
        }

        .invoice-title {
          font-size: 28px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: 1px;
          color: #0f172a;
        }

        .invoice-number {
          margin-top: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #1457d9;
        }

        .invoice-meta {
          margin-top: 9px;
          display: flex;
          justify-content: flex-end;
          gap: 18px;
        }

        .invoice-meta-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px 18px;
        }

        .invoice-meta div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .invoice-meta span {
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #94a3b8;
          font-weight: 700;
        }

        .invoice-meta strong {
          font-size: 10px;
          color: #334155;
        }

        /* =========================
           STATUS
        ========================== */

        .status-bar {
          margin-top: 6mm;
          padding: 9px 13px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          border: 1px solid #dbe3ef;
          border-radius: 8px;
          background: #f8fafc;
        }

        .status-item {
          min-width: 0;
        }

        .status-item span {
          display: block;
          margin-bottom: 3px;
          font-size: 8px;
          line-height: 1;
          text-transform: uppercase;
          letter-spacing: 0.9px;
          font-weight: 700;
          color: #94a3b8;
        }

        .status-item strong {
          display: block;
          overflow-wrap: anywhere;
          font-size: 10px;
          line-height: 1.3;
          font-weight: 700;
          color: #1e293b;
        }

        /* =========================
           INFORMATION
        ========================== */

        .information-section {
          margin-top: 6mm;
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: 9mm;
          padding-bottom: 5mm;
          border-bottom: 1px solid #dbe3ef;
        }

        .information-column {
          min-width: 0;
        }

        .order-column {
          padding-left: 9mm;
          border-left: 1px solid #dbe3ef;
        }

        .section-label {
          margin-bottom: 8px;
          font-size: 8px;
          line-height: 1;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          font-weight: 800;
          color: #64748b;
        }

        .customer-name {
          margin-bottom: 5px;
          font-size: 12px;
          line-height: 1.3;
          font-weight: 800;
          color: #0f172a;
        }

        .address,
        .contact-details {
          font-size: 10px;
          line-height: 1.55;
          color: #475569;
          overflow-wrap: anywhere;
        }

        .contact-details {
          margin-top: 6px;
        }

        .order-details {
          display: grid;
          gap: 5px;
        }

        .order-details div {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 15px;
          font-size: 10px;
        }

        .order-details span {
          color: #64748b;
          flex-shrink: 0;
        }

        .order-details strong {
          text-align: right;
          color: #1e293b;
          overflow-wrap: anywhere;
        }

        /* =========================
           PRODUCTS
        ========================== */

        .products-section {
          margin-top: 6mm;
          border: 1px solid #dbe3ef;
          border-radius: 8px;
          overflow: hidden;
        }

        .products-heading {
          display: grid;
          grid-template-columns:
            minmax(0, 2.7fr)
            minmax(0, 1.05fr)
            0.45fr
            0.95fr
            0.95fr;
          align-items: center;
          min-height: 34px;
          padding: 0 10px;
          background: #f1f5f9;
          border-bottom: 1px solid #dbe3ef;
          font-size: 8px;
          line-height: 1;
          text-transform: uppercase;
          letter-spacing: 0.9px;
          font-weight: 800;
          color: #475569;
        }

        .product-heading-name {
          text-align: left;
        }

        .product-heading-sku {
          text-align: left;
        }

        .product-heading-qty {
          text-align: center;
        }

        .product-heading-price,
        .product-heading-total {
          text-align: right;
        }

        .products-body {
          width: 100%;
        }

        .product-row {
          display: grid;
          grid-template-columns:
            minmax(0, 2.7fr)
            minmax(0, 1.05fr)
            0.45fr
            0.95fr
            0.95fr;
          align-items: center;
          min-height: 68px;
          padding: 8px 10px;
          border-bottom: 1px solid #e2e8f0;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .product-row:last-child {
          border-bottom: none;
        }

        .product-info {
          display: flex;
          align-items: center;
          min-width: 0;
          gap: 10px;
          padding-right: 10px;
        }

        .product-image {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 1px solid #dbe3ef;
          border-radius: 7px;
          background: white;
        }

        .product-image-element {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          padding: 4px;
        }

        .no-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          color: #1457d9;
          font-size: 17px;
          font-weight: 800;
        }

        .product-name-wrapper {
          min-width: 0;
        }

        .product-name {
          font-size: 9.5px;
          line-height: 1.45;
          font-weight: 700;
          color: #0f172a;
          overflow-wrap: anywhere;
        }

        .product-sku {
          min-width: 0;
          padding-right: 7px;
          font-size: 8.5px;
          line-height: 1.4;
          color: #64748b;
          overflow-wrap: anywhere;
        }

        .product-qty {
          text-align: center;
          font-size: 9.5px;
          font-weight: 700;
          color: #334155;
        }

        .product-price {
          text-align: right;
          padding-left: 5px;
          font-size: 9.5px;
          color: #475569;
          white-space: nowrap;
        }

        .product-total {
          text-align: right;
          padding-left: 5px;
          font-size: 9.5px;
          font-weight: 800;
          color: #0f172a;
          white-space: nowrap;
        }

        .empty-products {
          padding: 24px;
          text-align: center;
          font-size: 10px;
          color: #64748b;
        }

        /* =========================
           BOTTOM
        ========================== */

        .bottom-section {
          margin-top: 6mm;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 75mm;
          gap: 10mm;
          align-items: end;
        }

        .thank-you-area {
          min-width: 0;
          padding: 5px 0;
        }

        .thank-you-title {
          font-size: 12px;
          font-weight: 800;
          color: #1457d9;
        }

        .thank-you-text {
          max-width: 105mm;
          margin-top: 5px;
          font-size: 9px;
          line-height: 1.55;
          color: #64748b;
        }

        .totals-section {
          width: 100%;
          padding: 10px 13px;
          border: 1px solid #dbe3ef;
          border-radius: 8px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 4px 0;
          font-size: 10px;
        }

        .total-row span {
          color: #64748b;
        }

        .total-row strong {
          color: #334155;
          white-space: nowrap;
        }

        .total-divider {
          height: 1px;
          margin: 7px 0;
          background: #dbe3ef;
        }

        .grand-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding-top: 2px;
        }

        .grand-total span {
          font-size: 11px;
          font-weight: 800;
          color: #0f172a;
        }

        .grand-total strong {
          font-size: 15px;
          font-weight: 900;
          color: #1457d9;
          white-space: nowrap;
        }

        /* =========================
           FOOTER
        ========================== */

        .invoice-footer {
          margin-top: 5mm;
          padding-top: 4mm;
          border-top: 1px solid #cbd5e1;
          text-align: center;
        }

        .footer-branding {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #1457d9;
        }

        .footer-center {
          margin-top: 4px;
          font-size: 8.5px;
          line-height: 1.55;
          color: #94a3b8;
        }

        .footer-thanks {
          font-size: 9px;
          font-weight: 700;
          color: #334155;
        }

        .footer-support {
          margin-top: 4px;
          font-size: 8px;
          color: #94a3b8;
        }

        /* =========================
           PRINT
        ========================== */

        @media print {
          html,
          body {
            width: 210mm;
            min-height: 297mm;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .invoice-print-root {
            display: block !important;
            width: 210mm !important;
            background: white !important;
          }

          .invoice-print-page {
            width: 186mm !important;
            min-height: 273mm !important;
            height: 273mm !important;
            margin: 0 !important;
            padding: 4mm 5mm 4mm 5mm !important;
            overflow: hidden !important;
          }

          .products-section,
          .information-section,
          .bottom-section,
          .status-bar {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .product-row {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          img {
            break-inside: avoid;
          }
        }

        /* =========================
           SCREEN SAFETY
        ========================== */

        @media screen {
          .invoice-print-page {
            box-shadow:
              0 10px 40px rgba(15, 23, 42, 0.12);
            margin: 30px auto;
          }
        }
      `}</style>
    </div>
  );
}
