 export const Menu=  [
    {
        id: 1,
        label: "menuitems.navigation.text",
        isTitle: true,
        roles:["superadmin"],
    },
    {
        id: 2,
        label: "menuitems.dashboard.text",
        icon: "ri-dashboard-line",
        badge: {
            variant: "success",
            text: "menuitems.dashboard.badge"
        },
        isMenuCollapsed: false,
        subItems: [
            {
                id: 3,
                label: 'menuitems.dashboard.list.sales',
                link: '/'
            },
            {
                id: 4,
                label: 'menuitems.dashboard.list.crm',
                link: '/dashboard/crm'
            },
            {
                id: 5,
                label: 'menuitems.dashboard.list.analytics',
                link: '/dashboard/analytics'
            },
        ],
        roles:["superadmin"],
    },
    {
        id: 6,
        label: "menuitems.ecommerce.text",
        isTitle: true,
        roles:["superadmin"],
    },
    {
        id: 8,
        label: "menuitems.ecommerce.text",
        icon: "fe-shopping-cart",
        badge: {
            variant: "danger",
            text: "menuitems.ecommerce.badge"
        },
        isMenuCollapsed: false,
        roles:["superadmin"],
        subItems: [
            {
                id: 81,
                label: "menuitems.ecommerce.points.text",
                link: "/superadmin/points",
                icon: "ri-coin-fill text-warning"
            },
            {
                id: 82,
                label: "menuitems.ecommerce.orders.text",
                link: "/superadmin/orders"
            },
            {
                id: 83,
                label: "menuitems.ecommerce.vendor_orders.text",
                link: "/superadmin/orders/vendor_orderlist"
            },
        ]
    },
    {
        id: 9,
        label: "menuitems.organizations.text",
        icon: "fe-git-merge",
        badge: {
            variant: "danger",
            text: "menuitems.ecommerce.badge"
        },
        isMenuCollapsed: false,
        roles:["superadmin"],
        subItems: [
            {
                id: 91,
                label: "menuitems.organizations.vendor.text",
                link: "/superadmin/vendors"
            },
            {
                id: 92,
                label: "menuitems.organizations.client.text",
                link: "/superadmin/clients"
            },
            {
                id: 93,
                label: "menuitems.organizations.user.text",
                link: "/superadmin/users"
            },
            {
                id: 94,
                label: "menuitems.organizations.customer.text",
                link: "/superadmin/customers"
            },
        ]
    },
    {
        id: 7,
        label: "menuitems.system.text",
        icon: "fe-settings",
        badge: {
            variant: "danger",
            text: "menuitems.ecommerce.badge"
        },
        isMenuCollapsed: false,
        roles:["superadmin"],
        subItems: [
            {
                id: 71,
                label: "menuitems.system.text",
                link: "/superadmin/system"
            },
            {
                id: 72,
                label: "menuitems.ecommerce.list.products",
                link: "/superadmin/products"
            },
            {
                id: 73,
                label: "menuitems.ecommerce.list.shop_faqs",
                link: "/superadmin/faqs"
            },
        ]
    },


   // menuitems for client_admin
       {
        id: 201,
        label: "menuitems.navigation.text",
        isTitle: true,
        roles:["client_admin"],
    },

    {
        id: 202,
        label: "menuitems.dashboard.text",
        icon: "ri-dashboard-line",
        badge: {
            variant: "success",
            text: "menuitems.dashboard.badge"
        },
        isMenuCollapsed: false,
        subItems: [
            {
                id: 2021,
                label: 'menuitems.dashboard.list.followers',
                link: '/client_admin/followers',
                icon: "ri-team-line text-success"
            },
            {
                id: 2022,
                label: 'menuitems.ecommerce.points.text',
                link: '/client_admin/points',
                icon: "ri-coin-fill text-warning"
            },
        ],
        roles:["client_admin"],
    },
];

export default Menu;
