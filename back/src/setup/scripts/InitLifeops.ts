import ClientTypeServiceFactory from "../../modules/lifeops/factory/services/ClientTypeServiceFactory.js";
import CompanyTypeServiceFactory from "../../modules/lifeops/factory/services/CompanyTypeServiceFactory.js";
import ContactTypeServiceFactory from "../../modules/lifeops/factory/services/ContactTypeServiceFactory.js";
import PriorityServiceFactory from "../../modules/lifeops/factory/services/PriorityServiceFactory.js";
import TaskSourceServiceFactory from "../../modules/lifeops/factory/services/TaskSourceServiceFactory.js";
import TaskStatusServiceFactory from "../../modules/lifeops/factory/services/TaskStatusServiceFactory.js";
import TaskTypeServiceFactory from "../../modules/lifeops/factory/services/TaskTypeServiceFactory.js";

type SeedItem = {
    name: string;
    description?: string;
    color?: string;
}

type SeedService<T extends SeedItem> = {
    fetchAll(): Promise<unknown[]>;
    create(data: T): Promise<unknown>;
}

async function seedIfEmpty<T extends SeedItem>(service: SeedService<T>, items: T[]) {
    const existingItems = await service.fetchAll();
    if (existingItems.length > 0) {
        return;
    }

    for (const item of items) {
        await service.create(item);
    }
}

async function InitLifeops() {
    await seedIfEmpty(ClientTypeServiceFactory.instance, [
        {name: "Empresa", description: "Cliente empresa."},
        {name: "Persona", description: "Cliente Persona."},
    ]);

    await seedIfEmpty(CompanyTypeServiceFactory.instance, [
        {name: "Empresa", description: "Empresa."},
        {name: "Gobierno", description: "Entidad del Gobierno."},
        {name: "Proveedor", description: "Empresa que brinda productos o servicios."},
        {name: "Cliente", description: "Empresa que contrata o compra servicios."},
        {name: "Partner", description: "Empresa aliada para proyectos o acuerdos."},
        {name: "Competidor", description: "Empresa del mismo mercado o rubro."}
    ]);

    await seedIfEmpty(ContactTypeServiceFactory.instance, [
        {name: "Personal", description: "Contacto de uso personal."},
        {name: "Trabajo", description: "Contacto relacionado con trabajo u operaciones."},
        {name: "Comercial", description: "Contacto asociado a ventas o oportunidades."},
        {name: "Soporte", description: "Contacto para asistencia o seguimiento tecnico."}
    ]);

    await seedIfEmpty(PriorityServiceFactory.instance, [
        {name: "Baja", description: "Puede resolverse cuando haya disponibilidad.", color: "#22c55e"},
        {name: "Media", description: "Requiere seguimiento dentro del flujo normal.", color: "#eab308"},
        {name: "Alta", description: "Requiere atencion pronta.", color: "#f97316"},
        {name: "Critica", description: "Debe atenderse con maxima prioridad.", color: "#ef4444"}
    ]);

    await seedIfEmpty(TaskSourceServiceFactory.instance, [
        {name: "Manual", description: "Tarea creada manualmente por el usuario."},
        {name: "Asistente", description: "Tarea creada por el asistente IA."},
        {name: "Email", description: "Tarea originada desde un correo."},
        {name: "Reunion", description: "Tarea surgida de una reunion."},
        {name: "Chat", description: "Tarea registrada desde una conversacion."},
        {name: "Sistema", description: "Tarea generada automaticamente por el sistema."}
    ]);

    await seedIfEmpty(TaskStatusServiceFactory.instance, [
        {name: "Pendiente", description: "La tarea aun no fue iniciada."},
        {name: "En progreso", description: "La tarea esta siendo trabajada."},
        {name: "En espera", description: "La tarea depende de otra accion o respuesta."},
        {name: "Completada", description: "La tarea fue finalizada."},
        {name: "Cancelada", description: "La tarea ya no corresponde realizarla."}
    ]);

    await seedIfEmpty(TaskTypeServiceFactory.instance, [
        {name: "Llamada", description: "Comunicacion telefonica o por voz."},
        {name: "Email", description: "Envio o respuesta de correo."},
        {name: "Reunion", description: "Encuentro presencial o virtual."},
        {name: "Seguimiento", description: "Revision o control de un tema pendiente."},
        {name: "Administrativa", description: "Gestion operativa o documental."}
    ]);
}

export default InitLifeops;
export {InitLifeops};
