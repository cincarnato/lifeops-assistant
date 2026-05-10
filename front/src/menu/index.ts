import type {MenuItem} from '../types/menu'

const menu: MenuItem[] = [
  {
    icon: 'mdi-home',
    text:'home',
    link: { name: "Home" },
    gallery: false,
    auth: false
  },
  {
    icon: 'mdi-bullseye-arrow',
    text:'lifeops',
    gallery: true,
    permission: 'goal:manage',
    children: [
      {
        icon: 'mdi-flag-checkered',
        text:'goal.menu',
        link: { name: "GoalCrudPage" },
        gallery: true,
        permission: 'goal:manage'
      },
      {
        icon: 'mdi-briefcase-outline',
        text:'project.menu',
        link: { name: "ProjectCrudPage" },
        gallery: true,
        permission: 'project:manage'
      },
      {
        icon: 'mdi-domain',
        text:'client.menu',
        link: { name: "ClientCrudPage" },
        gallery: true,
        permission: 'client:manage'
      },
      {
        icon: 'mdi-card-account-details-outline',
        text:'contact.menu',
        link: { name: "ContactCrudPage" },
        gallery: true,
        permission: 'contact:manage'
      },
      {
        icon: 'mdi-office-building-outline',
        text:'company.menu',
        link: { name: "CompanyCrudPage" },
        gallery: true,
        permission: 'company:manage'
      },
      {
        icon: 'mdi-format-list-checks',
        text:'task.menu',
        link: { name: "TaskCrudPage" },
        gallery: true,
        permission: 'task:manage'
      },
      {
        icon: 'mdi-robot-outline',
        text:'Asistente de tareas',
        link: { name: "ChatbotTaskPage" },
        gallery: true,
        permission: 'task:create'
      },

    ]
  },
  {
    icon: 'mdi-bullseye-arrow',
    text:'Task Config',
    gallery: true,
    children: [

      {
        icon: 'mdi-shape-outline',
        text:'tasktype.menu',
        link: { name: "TaskTypeCrudPage" },
        gallery: true,
        permission: 'tasktype:manage'
      },
      {
        icon: 'mdi-progress-check',
        text:'taskstatus.menu',
        link: { name: "TaskStatusCrudPage" },
        gallery: true,
        permission: 'taskstatus:manage'
      },
      {
        icon: 'mdi-priority-high',
        text:'priority.menu',
        link: { name: "PriorityCrudPage" },
        gallery: true,
        permission: 'priority:manage'
      },
      {
        icon: 'mdi-source-branch',
        text:'tasksource.menu',
        link: { name: "TaskSourceCrudPage" },
        gallery: true,
        permission: 'tasksource:manage'
      },
      {
        icon: 'mdi-account-tag-outline',
        text:'contacttype.menu',
        link: { name: "ContactTypeCrudPage" },
        gallery: true,
        permission: 'contacttype:manage'
      },
      {
        icon: 'mdi-office-building-cog-outline',
        text:'companytype.menu',
        link: { name: "CompanyTypeCrudPage" },
        gallery: true,
        permission: 'companytype:manage'
      },
      {
        icon: 'mdi-domain-plus',
        text:'clienttype.menu',
        link: { name: "ClientTypeCrudPage" },
        gallery: true,
        permission: 'clienttype:manage'
      },
    ]
  },
  {
    icon: 'mdi-account-circle',
    text:'admin',
    gallery: true,
    permission: 'user:manage',
    children: [
      {
        icon: 'mdi-domain',
        text:'tenant.menu',
        link: { name: "CrudTenant" },
        gallery: true,
        permission: 'tenant:manage'
      },
      {
        icon: 'mdi-chair-rolling',
        text:'role.menu',
        link: { name: "CrudRole" },
        gallery: true,
        permission: 'role:manage'
      },

      {
        icon: 'mdi-table-account',
        text:'user.menu',
        link: { name: "CrudUser" },
        gallery: true,
        permission: 'user:manage'
      },
      {
        icon: 'mdi mdi-table-key',
        text:'userapikey.menu',
        link: { name: "CrudUserApiKey" },
        gallery: true,
        permission: 'userApiKey:manage'
      },
      {
        icon: 'mdi-account-arrow-right',
        text:'usersession.menu',
        link: { name: "UserSessionCrudPage" },
        gallery: true,
        permission: 'usersession:menu'
      },
      {
        icon: 'mdi-lock-alert-outline',
        text:'userloginfail.menu',
        link: { name: "UserLoginFailCrudPage" },
        gallery: true,
        permission: 'userloginfail:manage'
      },
      {
        icon: 'mdi mdi-cog',
        text:'setting.menu',
        link: { name: "SettingPage" },
        gallery: true,
        permission: 'setting:manage'
      },

      {
        icon: 'mdi-view-dashboard-edit',
        text:'dashboard.menu',
        link: { name: "DashboardCrudPage" },
        gallery: true,
        permission: 'dashboard:manage'
      },
      {
        icon: 'mdi-police-badge',
        text:'audit.menu',
        link: { name: "AuditCrudPage" },
        gallery: true,
        permission: 'audit:manage'
      },
      {
        icon: 'mdi-file',
        text:'file.menu',
        link: { name: "FileCrudPage" },
        gallery: true,
        permission: 'file:manage'
      },
      {
        icon: 'mdi-robot',
        text:'ailog.menu',
        link: { name: "AILogCrudPage" },
        gallery: true,
        permission: 'ailog:manage'
      },
      {
        icon: 'mdi-lock-check',
        text:'Password Policy',
        link: { name: "PasswordPolicy" },
        gallery: true,
      },
    ]
  },
  {
    icon: 'mdi-information-box',
    text:'info',
    gallery: true,
    auth: false,
    children: [
      {
        icon: 'mdi-information-outline',
        text:'POLITICA PRIVACIDAD',
        link: { name: "PoliticaPrivacidad" },
        gallery: true,
        auth: true
      },
      {
        icon: 'mdi-frequently-asked-questions',
        text:'CONDICIONES SERVICIO',
        link: { name: "CondicionesServicio" },
        gallery: true,
        auth: true
      },
    ]
  }
]

export default menu

export {
  menu
}
