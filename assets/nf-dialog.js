class NFCustomerOrders extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = {
      orders: [],
      lineItems: [],
      view: 'orders',
      isLoading: true,
      error: null,
      itemsPerPage: 10,
      nextPage: null,
      previousPage: null
    };
    this.onOrderIdClick = this.onOrderIdClick.bind(this);
    this.attachEventListeners();
  }

  connectedCallback() {
    if (document.readyState === 'complete') {
      this.initComponent();
    } else {
      window.addEventListener('load', () => this.initComponent());
    }
  }

  initComponent() {
    this.fetchOrders();
  }

  async fetchOrders(queryParams) {
    await window.refreshTokenIfNeeded();
    const { url, authToken } = window.customerOrdersApp;
    const headers = new Headers({
      'Authorization': `Bearer ${authToken}`
    });
    const requestOptions = {
      method: 'GET',
      headers,
      redirect: 'follow'
    };

    fetch(`${window.customerOrdersApp.urlProxy}api/v1/customer/orders?items=${this.state.itemsPerPage}${queryParams ? `&${queryParams}` : ``}`, requestOptions)
      .then(response => response.json())
      .then(data => {
        this.setState({
          orders: data?.data || [],
          isLoading: false,
          nextPage: data.pagination?.next,
          previousPage: data.pagination?.previous
        });
      })
      .catch(error => {
        this.setState({ error, isLoading: false });
      });
  }

  renderPagination() {
    return `
      <div class="pagination">
        <button id="prevPage" ${this.state.previousPage == null ? 'disabled' : ''}>${window.pageIcon}</button>
        <button id="nextPage" ${this.state.nextPage == null ? 'disabled' : ''}>${window.pageIcon}</button>
      </div>
    `;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  onBackClick(event) {
    event.preventDefault();
    this.setState({ view: 'orders', lineItems: [] });
    history.pushState({}, '', window.location.pathname);
  }

  renderOrders() {
    return this.state.orders.map(order => `
    <tr
    class="order_item" data-order-id="${order.id}"
    >
      <td
      class="nf-view_all"
      >
        <a href="javascript:void(0);" class="order_id">${order.name}</a>
      </td>
      <td >
        ${order.fulfillments.edges[0] ? `${window.icon_truck_solid}
        <a class="tracking-link" target="_blank" href="${order.fulfillments.edges[0].node.trackingUrls[0]}">
          ${window.String.customerTrack_and_trace}
        </a>` : ``}
      </td>
      <td colspan="2">${order.liquidShopifyCreatedAt}</td>
      <td>&euro;${order.totalPrice.replace(".", ",")}</td>
    </tr>
    `).join('');
  }

  renderLineItems() {
    // Implement rendering of line items
  }

  updateQuantity(button, increment) {
    // Implement quantity update logic
  }

  addToCart() {
    // Implement adding to cart logic
  }

  checkAndToggleATCButton() {
    // Implement button state logic
  }

  updateCartButtonUI(message) {
    // Implement cart button UI update logic
  }

  async fetchOrderLineItems(orderId) {
    // Implement fetching order line items
  }

  onOrderIdClick(event) {
    event.preventDefault();
    const orderId = event.currentTarget.getAttribute('data-order-id');
    if (orderId) {
      history.pushState({ orderId }, '', `?orderId=${orderId}`);
      this.setState({ isLoading: true });
      this.fetchOrderLineItems(orderId);
    }
  }

  attachEventListeners() {
    // Implement event listeners attachment
  }

  attachPaginationEventListeners() {
    // Implement pagination event listeners attachment
  }

  render() {
    let content;

    if (this.state.isLoading) {
      content = '<p>Loading...</p>';
    } else if (this.state.error) {
      content = `<p>Error: ${this.state.error.message}</p>`;
    } else if (this.state.view === 'lineItems') {
      // Implement rendering for line items view
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

    this.shadowRoot.innerHTML = content;
  }
}

customElements.define('nf-customer-orders', NFCustomerOrders);
