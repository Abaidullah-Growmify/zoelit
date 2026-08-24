"use client";

import { shortDate } from "@/lib/utils";

export function InvoicePrint({ order }) {
  const billing = order?.billing || {};
  const items = order?.lineItems || order?.items || [];

  const invoiceNumber =
    order?.customerOrderNumber || order?.orderNumber || "—";

  const orderDate = order?.date ? shortDate(order.date) : "—";
  const dueDate = order?.date ? shortDate(addDays(order.date, 7)) : "—";

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

  const itemDescription = (item) =>
    item?.description ||
    item?.category ||
    item?.productType ||
    item?.brand ||
    "";

  const itemSku = (item) =>
    item?.productId ||
    item?.ingramPartNumber ||
    item?.sku ||
    item?.partNumber ||
    "—";

  const addressLine = [
    billing.city,
    billing.state,
    billing.postal,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="invoice-print-root">
      <div className="invoice-print-page">

        {/* HEADER */}
        <header className="invoice-header">
          <div className="brand-area">

            <div className="brand-row">
              <div className="brand-mark">
                <span />
                <span />
                <span />
              </div>

              <div>
                <div className="brand-name">
                  Zoe<span>Lit</span>
                </div>

                <div className="brand-subtitle">
                  COMMERCE
                </div>
              </div>
            </div>

            <div className="company-list">
              <InfoLine icon="mail">
                support@zoelit.com
              </InfoLine>

              <InfoLine icon="globe">
                www.zoelit.com
              </InfoLine>

              <InfoLine icon="pin">
                123 Commerce St., Business City,
                <br />
                CA 90210, USA
              </InfoLine>
            </div>

          </div>

          <div className="invoice-title-area">

            <div className="invoice-title">
              INVOICE
            </div>

            <div className="invoice-number">
              #{invoiceNumber}
            </div>

            <div className="invoice-meta">
              <MetaRow
                label="Date"
                value={orderDate}
              />

              <MetaRow
                label="Currency"
                value={currencyCode}
              />

              <MetaRow
                label="Due Date"
                value={dueDate}
              />
            </div>

          </div>
        </header>


        {/* STATUS */}
        <section className="status-strip">

          <StatusItem
            icon="clipboard"
            label="Status"
            value={order?.status || "Processing"}
          />

          <StatusItem
            icon="card"
            label="Payment"
            value={order?.payment || "Paid"}
            accent="green"
          />

          <StatusItem
            icon="truck"
            label="Tracking"
            value={order?.tracking || "Not assigned"}
          />

          <StatusItem
            icon="box"
            label="Carrier"
            value={order?.carrierName || "—"}
          />

        </section>


        {/* BILLING + ORDER */}
        <section className="details-grid">

          <div>
            <div className="section-label">
              BILLING INFORMATION
            </div>

            <div className="info-card-line">

              <div className="circle-icon">
                <SvgIcon name="user" />
              </div>

              <div className="billing-copy">

                <div className="customer-name">
                  {customerName}
                </div>

                {billing.address && (
                  <div>{billing.address}</div>
                )}

                {addressLine && (
                  <div>{addressLine}</div>
                )}

                {billing.country && (
                  <div>{billing.country}</div>
                )}

                {billing.email && (
                  <div className="spaced-line">
                    {billing.email}
                  </div>
                )}

                {billing.phone && (
                  <div>{billing.phone}</div>
                )}

              </div>
            </div>
          </div>


          <div>

            <div className="section-label">
              ORDER INFORMATION
            </div>

            <div className="info-card-line order-info-line">

              <div className="circle-icon">
                <SvgIcon name="document" />
              </div>

              <div className="order-info-table">

                <MetaRow
                  label="Order Date"
                  value={orderDate}
                />

                <MetaRow
                  label="Order Number"
                  value={`#${invoiceNumber}`}
                />

                <MetaRow
                  label="Customer ID"
                  value={
                    order?.customerId ||
                    order?.customer?._id ||
                    "—"
                  }
                />

                <MetaRow
                  label="Sales Channel"
                  value={
                    order?.salesChannel ||
                    "Online Store"
                  }
                />

              </div>

            </div>
          </div>

        </section>


        {/* PRODUCTS */}
        <section className="items-section">

          <div className="section-label">
            ORDER ITEMS
          </div>

          <div className="items-heading">

            <div>PRODUCT</div>
            <div>SKU</div>
            <div>QTY</div>
            <div>UNIT PRICE</div>
            <div>TOTAL</div>

          </div>


          <div className="items-body">

            {items.length > 0 ? (
              items.map((item, index) => {

                const image = itemImage(item);
                const quantity = qty(item);
                const price = Number(item?.price) || 0;
                const lineTotal = price * quantity;
                const description = itemDescription(item);

                return (
                  <div
                    className="item-row"
                    key={
                      item?.productId ||
                      item?._id ||
                      item?.ingramPartNumber ||
                      index
                    }
                  >

                    <div className="product-cell">

                      <div className="product-image">

                        {image ? (
                          <img
                            src={image}
                            alt={itemName(item)}
                          />
                        ) : (
                          <div className="no-image">
                            Z
                          </div>
                        )}

                      </div>

                      <div>

                        <div className="product-name">
                          {itemName(item)}
                        </div>

                        {description && (
                          <div className="product-description">
                            {description}
                          </div>
                        )}

                      </div>

                    </div>


                    <div className="muted-cell">
                      {itemSku(item)}
                    </div>

                    <div className="center-cell">
                      {quantity}
                    </div>

                    <div className="money-cell">
                      {formatMoney(price)}
                    </div>

                    <div className="money-cell">
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


        {/* TOTALS */}
        <section className="totals-wrap">

          <div className="totals-box">

            <TotalRow
              label="Subtotal"
              value={formatMoney(subtotal)}
            />

            {discount > 0 && (
              <TotalRow
                label="Discount"
                value={`-${formatMoney(discount)}`}
                danger
              />
            )}

            <TotalRow
              label="Shipping"
              value={formatMoney(shipping)}
            />

            <div className="grand-total">

              <span>
                Grand Total
              </span>

              <strong>
                {formatMoney(total)}
              </strong>

            </div>

          </div>

        </section>


        {/* FOOTER */}
        <footer className="invoice-footer">

          <div className="footer-left">

            <div className="heart-circle">
              <SvgIcon name="heart" />
            </div>

            <div>

              <div className="footer-title">
                Thank you for your business!
              </div>

              <div className="footer-copy">
                We appreciate your trust in ZoeLit Commerce.
              </div>

            </div>

          </div>


          <div className="footer-right">

            <div className="footer-title">
              Need help?
            </div>

            <div className="footer-copy">
              support@zoelit.com
              &nbsp;&nbsp; | &nbsp;&nbsp;
              +1 (888) 123-4567
            </div>

          </div>

        </footer>

      </div>


      <style jsx global>{`

        @page {
          size: A4 portrait;
          margin: 0;
        }

        * {
          box-sizing: border-box;
        }


        /* =========================
           SCREEN
        ========================= */

        .invoice-print-root {
          width: 100%;
          background: #ffffff;
          color: #10172a;
          display: none;
          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;
        }

        .invoice-print-page {
          position: relative;

          width: 210mm;
          height: 297mm;

          margin: 30px auto;

          padding:
            14mm
            14mm
            10mm
            14mm;

          background: #ffffff;

          display: flex;
          flex-direction: column;

          overflow: hidden;

          box-shadow:
            0 10px 40px
            rgba(15, 23, 42, 0.12);
        }


        /* =========================
           HEADER
        ========================= */

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;

          flex-shrink: 0;
        }

        .brand-area {
          width: 55%;
        }

        .brand-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-mark {
          position: relative;

          width: 34px;
          height: 34px;

          transform: rotate(30deg);
        }

        .brand-mark span {
          position: absolute;

          width: 23px;
          height: 12px;

          border-radius: 3px;

          background:
            linear-gradient(
              135deg,
              #7c4dff,
              #4020c8
            );
        }

        .brand-mark span:nth-child(1) {
          top: 1px;
          left: 7px;
        }

        .brand-mark span:nth-child(2) {
          top: 11px;
          left: 0;

          background:
            linear-gradient(
              135deg,
              #5630df,
              #8f6cff
            );
        }

        .brand-mark span:nth-child(3) {
          top: 22px;
          left: 8px;

          background:
            linear-gradient(
              135deg,
              #3219bd,
              #6c45ff
            );
        }

        .brand-name {
          font-size: 25px;
          line-height: 1;

          font-weight: 900;

          letter-spacing: -1px;

          color: #111827;
        }

        .brand-name span {
          color: #5b36ef;
        }

        .brand-subtitle {
          margin-top: 5px;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 5px;

          color: #697186;
        }

        .company-list {
          margin-top: 20px;

          display: grid;
          gap: 8px;

          font-size: 9.5px;
          line-height: 1.35;

          color: #26314a;
        }

        .info-line {
          display: flex;
          align-items: flex-start;

          gap: 13px;
        }

        .small-icon {
          width: 12px;
          height: 12px;

          color: #586173;

          flex: 0 0 12px;
        }


        /* =========================
           INVOICE TITLE
        ========================= */

        .invoice-title-area {
          width: 49mm;

          padding-top: 2mm;
        }

        .invoice-title {
          font-size: 33px;
          line-height: 1;

          font-weight: 900;

          letter-spacing: 1px;

          color: #0b1224;
        }

        .invoice-number {
          margin-top: 8px;

          font-size: 15px;

          font-weight: 700;

          color: #5630df;
        }

        .invoice-meta {
          margin-top: 26px;

          display: grid;
          gap: 10px;
        }

        .meta-row {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            8px
            minmax(0, 1fr);

          gap: 8px;

          align-items: baseline;

          font-size: 10px;

          color: #1f2940;
        }

        .meta-row strong {
          font-size: 10px;

          font-weight: 500;

          color: #111827;

          overflow-wrap: anywhere;
        }


        /* =========================
           STATUS
        ========================= */

        .status-strip {
          margin-top: 13mm;

          min-height: 17mm;

          padding: 0 9mm;

          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          align-items: center;

          border-radius: 6px;

          background:
            linear-gradient(
              90deg,
              #fbfaff,
              #f3efff 48%,
              #fbfaff
            );

          flex-shrink: 0;
        }

        .status-item {
          min-height: 11mm;

          display: grid;

          grid-template-columns:
            26px
            minmax(0, 1fr);

          gap: 10px;

          align-items: center;

          padding: 0 8px;

          border-right:
            1px solid #d9d2ec;
        }

        .status-item:last-child {
          border-right: 0;
        }

        .status-icon {
          width: 19px;
          height: 19px;

          color: #5630df;
        }

        .status-label {
          font-size: 9px;

          color: #26314a;
        }

        .status-value {
          margin-top: 4px;

          font-size: 9px;

          line-height: 1.2;

          color: #5630df;

          font-weight: 700;

          overflow-wrap: anywhere;
        }

        .status-value.green {
          color: #0c9a2f;
        }


        /* =========================
           DETAILS
        ========================= */

        .details-grid {
          margin-top: 9mm;

          display: grid;

          grid-template-columns:
            1fr
            1fr;

          column-gap: 18mm;

          flex-shrink: 0;
        }

        .section-label {
          margin-bottom: 8px;

          font-size: 9.5px;

          font-weight: 900;

          letter-spacing: 1.5px;

          color: #121a2e;
        }

        .info-card-line {
          display: grid;

          grid-template-columns:
            38px
            minmax(0, 1fr);

          gap: 10px;

          align-items: flex-start;
        }

        .circle-icon,
        .heart-circle {
          width: 34px;
          height: 34px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 999px;

          background: #f2efff;

          color: #5630df;
        }

        .circle-icon svg,
        .heart-circle svg {
          width: 17px;
          height: 17px;
        }

        .billing-copy {
          font-size: 9.5px;

          line-height: 1.45;

          color: #111827;
        }

        .customer-name {
          margin-bottom: 2px;

          font-size: 12px;

          line-height: 1.2;

          font-weight: 900;
        }

        .spaced-line {
          margin-top: 5px;
        }

        .order-info-line {
          grid-template-columns:
            38px
            minmax(0, 1fr);
        }

        .order-info-table {
          display: grid;

          gap: 7px;
        }


        /* =========================
           ITEMS
        ========================= */

        .items-section {
          margin-top: 8mm;

          flex-shrink: 0;
        }

        .items-heading,
        .item-row {
          display: grid;

          grid-template-columns:
            minmax(0, 2.8fr)
            1fr
            0.55fr
            1.1fr
            1.1fr;

          align-items: center;

          column-gap: 7px;
        }

        .items-heading {
          height: 25px;

          padding: 0 9px;

          border-radius: 5px;

          background:
            linear-gradient(
              90deg,
              #fbfaff,
              #f3efff 48%,
              #fbfaff
            );

          font-size: 8px;

          font-weight: 900;

          color: #172035;
        }

        .items-heading div:nth-child(3) {
          text-align: center;
        }

        .items-heading div:nth-child(4),
        .items-heading div:nth-child(5) {
          text-align: right;
        }

        .item-row {
          min-height: 17mm;

          padding: 5px 9px;

          border-bottom:
            1px solid #dbe0eb;

          break-inside: avoid;

          page-break-inside: avoid;
        }

        .product-cell {
          display: grid;

          grid-template-columns:
            42px
            minmax(0, 1fr);

          gap: 10px;

          align-items: center;

          min-width: 0;
        }

        .product-image {
          width: 40px;
          height: 40px;

          display: flex;

          align-items: center;
          justify-content: center;

          overflow: hidden;

          border:
            1px solid #dbe0eb;

          border-radius: 7px;

          background: #ffffff;
        }

        .product-image img {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: contain;

          padding: 3px;
        }

        .no-image {
          width: 100%;
          height: 100%;

          display: flex;

          align-items: center;
          justify-content: center;

          background: #f5f7fb;

          color: #5630df;

          font-weight: 900;
        }

        .product-name {
          font-size: 9px;

          line-height: 1.25;

          font-weight: 900;

          color: #10172a;

          overflow-wrap: anywhere;
        }

        .product-description {
          margin-top: 2px;

          font-size: 8px;

          line-height: 1.2;

          color: #26314a;

          overflow-wrap: anywhere;
        }

        .muted-cell,
        .center-cell,
        .money-cell {
          font-size: 9px;

          color: #172035;
        }

        .muted-cell {
          overflow-wrap: anywhere;
        }

        .center-cell {
          text-align: center;
        }

        .money-cell {
          text-align: right;

          white-space: nowrap;
        }

        .empty-products {
          padding: 20px;

          text-align: center;

          font-size: 10px;

          color: #697186;

          border-bottom:
            1px solid #dbe0eb;
        }


        /* =========================
           TOTALS
        ========================= */

        .totals-wrap {
          display: flex;

          justify-content: flex-end;

          flex-shrink: 0;
        }

        .totals-box {
          width: 63mm;

          padding-top: 5px;
        }

        .total-row {
          display: flex;

          justify-content: space-between;

          gap: 15px;

          padding: 2.5px 4px;

          font-size: 9.5px;

          color: #10172a;
        }

        .total-row strong {
          font-weight: 500;

          white-space: nowrap;
        }

        .total-row.danger strong {
          color: #d71920;
        }

        .grand-total {
          margin-top: 3px;

          padding: 6px 9px;

          display: flex;

          justify-content: space-between;

          align-items: center;

          border-radius: 5px;

          background:
            linear-gradient(
              90deg,
              #fbfaff,
              #efe9ff
            );

          font-size: 11px;

          font-weight: 900;
        }

        .grand-total strong {
          font-size: 12px;

          color: #111827;

          white-space: nowrap;
        }


        /* =========================
           FOOTER
        ========================= */

        .invoice-footer {
          margin-top: auto;

          padding-top: 6mm;

          border-top:
            1.5px solid #9b7cff;

          display: flex;

          justify-content: space-between;

          align-items: center;

          flex-shrink: 0;
        }

        .footer-left {
          display: flex;

          align-items: center;

          gap: 14px;
        }

        .footer-title {
          font-size: 9px;

          font-weight: 900;

          color: #5630df;
        }

        .footer-copy {
          margin-top: 4px;

          font-size: 8px;

          color: #26314a;
        }

        .footer-right {
          text-align: left;
        }


        /* =========================
           PRINT
        ========================= */

        @media print {

          html,
          body {
            width: 210mm !important;

            height: 297mm !important;

            min-height: 297mm !important;

            margin: 0 !important;

            padding: 0 !important;

            overflow: visible !important;

            background: #ffffff !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;

            print-color-adjust: exact !important;
          }

          /*
            Hide complete dashboard
            and show only invoice
          */

          body > * {
            visibility: hidden !important;
          }

          .invoice-print-root,
          .invoice-print-root * {
            visibility: visible !important;
          }

          /*
            Force invoice to exact
            A4 print area
          */

          .invoice-print-root {
            position: fixed !important;

            top: 0 !important;

            left: 0 !important;

            width: 210mm !important;

            height: 297mm !important;

            min-height: 297mm !important;

            max-height: 297mm !important;

            margin: 0 !important;

            padding: 0 !important;

            display: block !important;

            overflow: visible !important;

            background: #ffffff !important;

            z-index: 999999 !important;
          }

          .invoice-print-page {
            position: relative !important;

            width: 210mm !important;

            height: 297mm !important;

            min-height: 297mm !important;

            max-height: 297mm !important;

            margin: 0 !important;

            padding:
              14mm
              14mm
              10mm
              14mm !important;

            overflow: hidden !important;

            box-shadow: none !important;

            background: #ffffff !important;

            display: flex !important;

            flex-direction: column !important;
          }

          .invoice-header {
            flex: 0 0 auto !important;

            display: flex !important;

            justify-content: space-between !important;

            align-items: flex-start !important;

            width: 100% !important;
          }

          .brand-area,
          .invoice-title-area {
            display: block !important;
          }

          .status-strip {
            flex: 0 0 auto !important;

            margin-top: 10mm !important;
          }

          .details-grid {
            flex: 0 0 auto !important;

            margin-top: 8mm !important;
          }

          .items-section {
            flex: 0 0 auto !important;

            margin-top: 8mm !important;
          }

          .items-heading {
            height: 25px !important;
          }

          .item-row {
            min-height: 15mm !important;

            padding: 4px 9px !important;
          }

          .product-image {
            width: 40px !important;

            height: 40px !important;
          }

          .totals-wrap {
            flex: 0 0 auto !important;

            margin-top: 2mm !important;
          }

          .invoice-footer {
            flex: 0 0 auto !important;

            margin-top: auto !important;

            padding-top: 6mm !important;

            display: flex !important;

            justify-content: space-between !important;

            align-items: center !important;

            border-top: 1.5px solid #9b7cff !important;
          }

          .invoice-header,
          .status-strip,
          .details-grid,
          .items-section,
          .items-body,
          .item-row,
          .totals-wrap,
          .invoice-footer {
            break-inside: avoid !important;

            page-break-inside: avoid !important;
          }

          .product-image img {
            print-color-adjust: exact !important;

            -webkit-print-color-adjust: exact !important;
          }

          .status-strip,
          .items-heading,
          .grand-total,
          .circle-icon,
          .heart-circle {
            -webkit-print-color-adjust: exact !important;

            print-color-adjust: exact !important;
          }
        }

      `}</style>
    </div>
  );
}


/* =========================
   HELPERS
========================= */

function MetaRow({ label, value }) {
  return (
    <div className="meta-row">
      <span>{label}</span>

      <span>:</span>

      <strong>{value}</strong>
    </div>
  );
}


function TotalRow({
  label,
  value,
  danger,
}) {
  return (
    <div
      className={`total-row${
        danger ? " danger" : ""
      }`}
    >
      <span>{label}</span>

      <strong>{value}</strong>
    </div>
  );
}


function StatusItem({
  icon,
  label,
  value,
  accent,
}) {
  return (
    <div className="status-item">

      <SvgIcon
        name={icon}
        className="status-icon"
      />

      <div>

        <div className="status-label">
          {label}
        </div>

        <div
          className={`status-value${
            accent
              ? ` ${accent}`
              : ""
          }`}
        >
          {value}
        </div>

      </div>

    </div>
  );
}


function InfoLine({
  icon,
  children,
}) {
  return (
    <div className="info-line">

      <SvgIcon
        name={icon}
        className="small-icon"
      />

      <div>
        {children}
      </div>

    </div>
  );
}


function addDays(date, days) {
  const result = new Date(date);

  result.setDate(
    result.getDate() + days
  );

  return result;
}


function SvgIcon({
  name,
  className = "",
}) {
  const common = {
    fill: "none",

    stroke: "currentColor",

    strokeWidth: 1.8,

    strokeLinecap: "round",

    strokeLinejoin: "round",

    viewBox: "0 0 24 24",

    className,
  };

  const paths = {

    mail: (
      <>
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
        />

        <path d="m3 7 9 7 9-7" />
      </>
    ),

    globe: (
      <>
        <circle
          cx="12"
          cy="12"
          r="9"
        />

        <path d="M3 12h18" />

        <path d="M12 3a14 14 0 0 1 0 18" />

        <path d="M12 3a14 14 0 0 0 0 18" />
      </>
    ),

    pin: (
      <>
        <path d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z" />

        <circle
          cx="12"
          cy="9"
          r="2.4"
        />
      </>
    ),

    clipboard: (
      <>
        <path d="M9 4h6l1 2h3v15H5V6h3l1-2Z" />

        <path d="M9 10h6M9 14h6" />
      </>
    ),

    card: (
      <>
        <rect
          x="3"
          y="6"
          width="18"
          height="13"
          rx="2"
        />

        <path d="M3 10h18M7 15h4" />
      </>
    ),

    truck: (
      <>
        <path d="M3 7h11v10H3zM14 11h4l3 3v3h-7z" />

        <circle
          cx="7"
          cy="18"
          r="1.7"
        />

        <circle
          cx="17"
          cy="18"
          r="1.7"
        />
      </>
    ),

    box: (
      <>
        <path d="M4 8h16l-2 12H6L4 8Z" />

        <path d="M8 8l2-4h4l2 4M9 12h6" />
      </>
    ),

    user: (
      <>
        <circle
          cx="12"
          cy="8"
          r="3"
        />

        <path d="M5 20a7 7 0 0 1 14 0" />
      </>
    ),

    document: (
      <>
        <path d="M7 3h7l4 4v14H7z" />

        <path d="M14 3v5h5M10 13h5M10 17h5" />
      </>
    ),

    heart: (
      <path
        d="M20.8 8.6c0 5.1-8.8 10.2-8.8 10.2S3.2 13.7 3.2 8.6A4.5 4.5 0 0 1 12 7.2a4.5 4.5 0 0 1 8.8 1.4Z"
        fill="currentColor"
        stroke="none"
      />
    ),

  };

  return (
    <svg {...common}>
      {paths[name]}
    </svg>
  );
}
