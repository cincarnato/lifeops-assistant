import type {MenuItem} from '../types/menu'

const menu: MenuItem[] = [
  {
    icon: 'mdi-home',
    text: 'home',
    link: {name: "Home"},
    gallery: false,
    auth: false
  },
  {
    icon: 'mdi-shield-account-outline',
    text: 'Privacidad y cuenta',
    link: {name: "AccountPrivacy"},
    gallery: false,
    auth: true
  },

  {
    icon: 'mdi-bullseye-arrow',
    text: 'Core',
    gallery: true,
    cols: 12,
    md:6,
    lg:4,
    children: [
      {
        icon: 'mdi-format-list-checks',
        text: 'task.menu',
        link: {name: "TaskCrudPage"},
        gallery: true,
        permission: 'task:manage'
      },
      {
        icon: 'mdi-view-dashboard-outline',
        text: 'Kanban Tareas',
        link: {name: "KanbanTaskPage"},
        gallery: true,
        permission: 'task:manage'
      },
      {
        icon: 'mdi-view-dashboard',
        text: 'Dashboard Tareas',
        link: {name: "TaskDashboardPage"},
        gallery: true,
        permission: 'task:manage'
      },
      {
        icon: 'mdi-briefcase-outline',
        text: 'project.menu',
        link: {name: "ProjectCrudPage"},
        gallery: true,
        permission: 'project:manage'
      },
      {
        icon: 'mdi-brain',
        text: 'memory.menu',
        link: {name: "MemoryCrudPage"},
        gallery: true,
        permission: 'memory:manage'
      },
      {
        icon: 'mdi-calendar-check-outline',
        text: 'habitlog.menu',
        link: {name: "HabitLogCrudPage"},
        gallery: true,
        permission: 'habitlog:manage'
      },
      {
        icon: 'mdi-calendar-today-outline',
        text: 'dayplan.menu',
        link: {name: "DayPlanCrudPage"},
        gallery: true,
        permission: 'dayplan:manage'
      },


    ]
  },

  {
    icon: 'mdi-bullseye-arrow',
    text: 'AGENT',
    gallery: true,
    cols: 12,
    md:6,
    lg:4,
    children: [
      {
        icon: 'mdi-robot',
        text: 'Agent',
        link: {name: "AgentPage"},
        gallery: true,
        permission: 'agent:session'
      },
      {
        icon: 'mdi-robot',
        text: 'Agent Cine',
        link: {name: "AgentCinePage"},
        gallery: true,
        permission: 'agent:session'
      },
      {
        icon: 'mdi-robot-industrial-outline',
        text: 'agentjob.menu',
        link: {name: "AgentJobCrudPage"},
        gallery: true,
        permission: 'agentjob:manage'
      },
      {
        icon: 'mdi-progress-clock',
        text: 'agentjobexecution.menu',
        link: {name: "AgentJobExecutionCrudPage"},
        gallery: true,
        permission: 'agentjobexecution:manage'
      },
    ]
  },
  {
    icon: 'mdi-bullseye-arrow',
    text: 'Gestion',
    gallery: true,
    cols: 12,
    md:6,
    lg:4,
    children: [
      {
        icon: 'mdi-domain',
        text: 'client.menu',
        link: {name: "ClientCrudPage"},
        gallery: true,
        permission: 'client:manage'
      },
      {
        icon: 'mdi-card-account-details-outline',
        text: 'contact.menu',
        link: {name: "ContactCrudPage"},
        gallery: true,
        permission: 'contact:manage'
      },
      {
        icon: 'mdi-office-building-outline',
        text: 'company.menu',
        link: {name: "CompanyCrudPage"},
        gallery: true,
        permission: 'company:manage'
      },


    ]
  },
  {
    icon: 'mdi-bullseye-arrow',
    text: 'Horizonte',
    gallery: true,
    cols: 12,
    md:6,
    lg:4,
    children: [
      {
        icon: 'mdi-compass-outline',
        text: 'purpose.menu',
        link: {name: "PurposeCrudPage"},
        gallery: true,
        permission: 'purpose:manage'
      },

      {
        icon: 'mdi-flag-checkered',
        text: 'goal.menu',
        link: {name: "GoalCrudPage"},
        gallery: true,
        permission: 'goal:manage'
      },
      {
        icon: 'mdi-repeat',
        text: 'habit.menu',
        link: {name: "HabitCrudPage"},
        gallery: true,
        permission: 'habit:manage'
      },

    ]
  },

  {
    icon: 'mdi-bullseye-arrow',
    text: 'Config',
    gallery: true,
    cols: 12,
    md:6,
    lg:4,
    children: [

      {
        icon: 'mdi-shape-outline',
        text: 'tasktype.menu',
        link: {name: "TaskTypeCrudPage"},
        gallery: true,
        permission: 'tasktype:manage'
      },
      {
        icon: 'mdi-progress-check',
        text: 'taskstatus.menu',
        link: {name: "TaskStatusCrudPage"},
        gallery: true,
        permission: 'taskstatus:manage'
      },
      {
        icon: 'mdi-priority-high',
        text: 'priority.menu',
        link: {name: "PriorityCrudPage"},
        gallery: true,
        permission: 'priority:manage'
      },
      {
        icon: 'mdi-source-branch',
        text: 'source.menu',
        link: {name: "SourceCrudPage"},
        gallery: true,
        permission: 'source:manage'
      },
      {
        icon: 'mdi-shape-outline',
        text: 'lifearea.menu',
        link: {name: "LifeAreaCrudPage"},
        gallery: true,
        permission: 'lifearea:manage'
      },
      {
        icon: 'mdi-account-tag-outline',
        text: 'contacttype.menu',
        link: {name: "ContactTypeCrudPage"},
        gallery: true,
        permission: 'contacttype:manage'
      },
      {
        icon: 'mdi-office-building-cog-outline',
        text: 'companytype.menu',
        link: {name: "CompanyTypeCrudPage"},
        gallery: true,
        permission: 'companytype:manage'
      },
      {
        icon: 'mdi-domain-plus',
        text: 'clienttype.menu',
        link: {name: "ClientTypeCrudPage"},
        gallery: true,
        permission: 'clienttype:manage'
      },
      {
        icon: 'mdi-brain',
        text: 'memorytype.menu',
        link: {name: "MemoryTypeCrudPage"},
        gallery: true,
        permission: 'memorytype:manage'
      },
    ]
  },
  {
    icon: 'mdi-google',
    text: 'Google',
    gallery: true,
    cols: 12,
    md:6,
    lg:4,
    children: [
      {
        icon: 'mdi-link-variant',
        text: 'Conectar Google',
        link: {name: "GoogleConnectionPage"},
        gallery: true,
        permission: 'googleconnection:manage'
      },
      {
        icon: 'mdi-email-outline',
        text: 'Mails',
        link: {name: "GoogleGmailPage"},
        gallery: true,
        permission: 'googleconnection:view'
      },
      {
        icon: 'mdi-calendar-month-outline',
        text: 'Calendario',
        link: {name: "GoogleCalendarPage"},
        gallery: true,
        permission: 'googleconnection:view'
      },
      {
        icon: 'mdi-account-sync-outline',
        text: 'Sincronizar contactos',
        link: {name: "GoogleContactsSyncPage"},
        gallery: true,
        permission: 'googleconnection:view'
      },
      {
        icon: 'mdi-table-cog',
        text: 'googleconnection.menu',
        link: {name: "GoogleConnectionCrudPage"},
        gallery: true,
        permission: 'googleconnection:manage'
      },
    ]
  },
  {
    icon: 'mdi-bell-ring-outline',
    text: 'Push',
    gallery: true,
    cols: 12,
    md:6,
    lg:4,
    children: [
      {
        icon: 'mdi-cellphone-link',
        text: 'pushdevice.menu',
        link: {name: "PushDeviceCrudPage"},
        gallery: true,
        permission: 'pushdevice:manage'
      },
      {
        icon: 'mdi-message-badge-outline',
        text: 'pushmessage.menu',
        link: {name: "PushMessageCrudPage"},
        gallery: true,
        permission: 'pushmessage:manage'
      },
    ]
  },
  {
    icon: 'mdi-account-circle',
    text: 'admin',
    gallery: true,
    cols: 12,
    md:6,
    lg:4,
    permission: 'user:manage',
    children: [
      {
        icon: 'mdi-domain',
        text: 'tenant.menu',
        link: {name: "CrudTenant"},
        gallery: true,
        permission: 'tenant:manage'
      },
      {
        icon: 'mdi-chair-rolling',
        text: 'role.menu',
        link: {name: "CrudRole"},
        gallery: true,
        permission: 'role:manage'
      },

      {
        icon: 'mdi-table-account',
        text: 'user.menu',
        link: {name: "CrudUser"},
        gallery: true,
        permission: 'user:manage'
      },
      {
        icon: 'mdi mdi-table-key',
        text: 'userapikey.menu',
        link: {name: "CrudUserApiKey"},
        gallery: true,
        permission: 'userApiKey:manage'
      },
      {
        icon: 'mdi-account-arrow-right',
        text: 'usersession.menu',
        link: {name: "UserSessionCrudPage"},
        gallery: true,
        permission: 'usersession:menu'
      },
      {
        icon: 'mdi-lock-alert-outline',
        text: 'userloginfail.menu',
        link: {name: "UserLoginFailCrudPage"},
        gallery: true,
        permission: 'userloginfail:manage'
      },
      {
        icon: 'mdi mdi-cog',
        text: 'setting.menu',
        link: {name: "SettingPage"},
        gallery: true,
        permission: 'setting:manage'
      },

      {
        icon: 'mdi-view-dashboard-edit',
        text: 'dashboard.menu',
        link: {name: "DashboardCrudPage"},
        gallery: true,
        permission: 'dashboard:manage'
      },
      {
        icon: 'mdi-police-badge',
        text: 'audit.menu',
        link: {name: "AuditCrudPage"},
        gallery: true,
        permission: 'audit:manage'
      },
      {
        icon: 'mdi-file',
        text: 'file.menu',
        link: {name: "FileCrudPage"},
        gallery: true,
        permission: 'file:manage'
      },

      {
        icon: 'mdi-lock-check',
        text: 'Password Policy',
        link: {name: "PasswordPolicy"},
        gallery: true,
      },
      {
        icon: 'mdi-robot',
        text: 'ailog.menu',
        link: {name: "AILogCrudPage"},
        gallery: true,
        permission: 'ailog:manage'
      },
      {
        icon: 'mdi-robot',
        text: 'agentsession.menu',
        link: {name: "AgentSessionCrudPage"},
        gallery: true,
        permission: 'agentsession:manage'
      },
      {
        icon: 'mdi-account-voice',
        text:'ttsvoice.menu',
        link: { name: "TTSVoiceCrudPage" },
        gallery: true,
        permission: 'ttsvoice:manage'
      },
    ]
  },
  {
    icon: 'mdi-information-box',
    text: 'info',
    gallery: true,
    auth: false,
    cols: 12,
    md:6,
    lg:4,
    children: [
      {
        icon: 'mdi-information-outline',
        text: 'POLITICA PRIVACIDAD',
        link: {name: "PoliticaPrivacidad"},
        gallery: true,
        auth: true
      },
      {
        icon: 'mdi-frequently-asked-questions',
        text: 'CONDICIONES SERVICIO',
        link: {name: "CondicionesServicio"},
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
