class NFCustomerOrders extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = {
      orders: [],
      lineItems: [],
      view: 'orders',
      isLoading: false,
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
    this.render();
    this.fetchOrders();
    this.checkAndToggleATCButton();
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

    this.setState({ isLoading: true });

    fetch(`${window.customerOrdersApp.urlProxy}api/v1/customer/orders?items=${this.state.itemsPerPage}${queryParams ? `&${queryParams}` : ``}`, requestOptions)
      .then(response => response.json())
      .then(data => {
        this.setState({
          orders: data?.data,
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
    const orders = this.state.orders;
    if (orders.length === 0) {
      return ''; // Return empty string if there are no orders
    }

    // Render table head only if there are orders
    return `
      <thead>
        <tr>
          <th>${window.String.customerOrder}</th>
          <th>${window.String.customerTrack_and_trace}</th>
          <th colspan="2">${window.String.customerDate}</th>
          <th>${window.String.customerTotal}</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => `
          <tr class="order_item" data-order-id="${order.id}">
            <td class="nf-view_all">
              <a href="javascript:void(0);" class="order_id">${order.name}</a>
            </td>
            <td>
              ${order.fulfillments.edges[0] ? `${window.icon_truck_solid}
                <a class="tracking-link" target="_blank" href="${order.fulfillments.edges[0].node.trackingUrls[0]}">
                  ${window.String.customerTrack_and_trace}
                </a>` : ``}
            </td>
            <td colspan="2">${order.liquidShopifyCreatedAt}</td>
            <td>&euro;${order.totalPrice.replace(".", ",")}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
  }

  renderLineItems() {
    // Your existing renderLineItems() implementation
  }

  // Your other methods...

  render() {
    let content;

    if (this.state.isLoading) {
      content = '<p>Loading...</p>';
    } else if (this.state.error) {
      content = `<p>Error: ${this.state.error.message}</p>`;
    } else if (this.state.view === 'lineItems') {
      // Your existing rendering logic for line items view
    } else {
      content = `
        <table class="nf-my-orders__table">
          ${this.renderOrders()} <!-- Render orders here -->
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

  // Your other methods...
}

customElements.define('nf-customer-orders', NFCustomerOrders);
