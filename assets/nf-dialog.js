render() {
    let content;

    if (this.state.isLoading) {
      content = '<p>Loading...</p>';
    } else if (this.state.error) {
      content = `<p>Error: ${this.state.error.message}</p>`;
    } else if (this.state.view === 'lineItems') {
      this.checkAndToggleATCButton();
      const urlParams = new URLSearchParams(window.location.search);
      const currentOrderId = urlParams.get('orderId');
      let currentOrders = this.state.orders.find(order => order.id == currentOrderId) || {};
      content = `
        <span class="nf-return-button" id="backButton">${window.backButton}</span>
        <div id="nf-order-view">
          <div class="nf-section nf-my-orders__wrapper">
            <div class="nf-section nf-my-orders__wrapper nf-view-orders">
              <div class="nf-section-heading">
                <div>
                  <h1 class="nf-order-name" style="display:inline;">${currentOrders.name}</h1>
                  <div class="order__status-info">
                    <p>${window.String.customerOrderDate} ${currentOrders.liquidShopifyCreatedAt.toLowerCase()}</p>
                    ${currentOrders.cancelledAt ? (
          currentOrders.cancelledAt
        ) : ("")}
                  </div>
                  <div class="order-details-track-and-trace" style="{{ tracking_url_display }}">
                    <p>
                      ${currentOrders.fulfillments.edges[0] ? `${window.icon_truck_solid}
                      <a class="tracking-link" target="_blank" href="${currentOrders.fulfillments.edges[0].node.trackingUrls[0]}">
                        ${window.String.customerTrack_and_trace}
                      </a>` : ``}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="nf-my-orders__table recently_ordered">
              <div class="account-product__grid">
              ${this.renderLineItems()}
              </div>
              <div class="re-order-cta-btn--wrapper">
                <button
                  class="re-order-cta re-order-btn add-to-cart-button"
                >
                ${window.String.reOrderSelectedItems}
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      content = `
        <table class="nf-my-orders__table">
          <thead>
            <tr>
            <th>${window.String.customerOrder}</th>
            <th>${window.String.customerTrack_and_trace}</th>
            <th colspan="2">${window.String.customerDate}</th>
            <th>${window.String.customerTotal}</th>
            </tr>
          </thead>
          <tbody>
            ${this.renderOrders()}
          </tbody>
        </table>
        ${this.renderPagination()}
      `;
    }

    this.shadowRoot.innerHTML = `
      ${content}
    `;
    this.shadowRoot.querySelectorAll('.order_item').forEach(element => {
      element.addEventListener('click', this.onOrderIdClick.bind(this));
    });
    if (this.state.view === 'orders') {
      // this.shadowRoot.querySelectorAll('.order_item').forEach(element => {
      //   element.addEventListener('click', this.onOrderIdClick.bind(this));
      // });
    } else {
      this.shadowRoot.querySelector('#backButton').addEventListener('click', this.onBackClick.bind(this));
    }
    this.attachPaginationEventListeners();
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = window.Shopify.theme.stylesheetUrl;
    this.shadowRoot.append(styleLink);

    const styleLinkLoader = document.createElement('link');
    styleLinkLoader.rel = 'stylesheet';
    styleLinkLoader.href = window.Shopify.theme.loading;
    this.shadowRoot.append(styleLinkLoader);

  }
