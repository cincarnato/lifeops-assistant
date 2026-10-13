
const messages = {
  en: {

    instruction: {
          entity: 'Instruction',
          menu: 'Instruction library',
          crud: 'Instruction library',
          field:{
                       title:'Title',
           description:'Description',
           content:'Content'
          },
          tabs: {

          }
      },
      permission: {
              'instruction:view': 'View Instruction',
              'instruction:create': 'Create Instruction',
              'instruction:update': 'Edit Instruction',
              'instruction:delete': 'Delete Instruction',
              'instruction:manage': 'Manage Instruction',
      }
  },
  es: {
     instruction: {
          entity: 'Instrucción',
          menu: 'Biblioteca de instrucciones',
          crud: 'Biblioteca de instrucciones',
          field:{
                       title:'Título',
           description:'Descripción',
           content:'Contenido'
          },
          tabs: {

          }
      },
     permission: {
              'instruction:view': 'Ver instrucciones',
              'instruction:create': 'Crear instrucciones',
              'instruction:update': 'Editar instrucciones',
              'instruction:delete': 'Eliminar instrucciones',
              'instruction:manage': 'Gestionar instrucciones',
     }
  }
}

export default messages;
