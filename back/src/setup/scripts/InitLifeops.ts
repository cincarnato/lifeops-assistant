import ClientTypeServiceFactory from "../../modules/lifeops/factory/services/ClientTypeServiceFactory.js";
import CompanyTypeServiceFactory from "../../modules/lifeops/factory/services/CompanyTypeServiceFactory.js";
import ContactTypeServiceFactory from "../../modules/lifeops/factory/services/ContactTypeServiceFactory.js";
import LifeAreaServiceFactory from "../../modules/lifeops/factory/services/LifeAreaServiceFactory.js";
import MemoryTypeServiceFactory from "../../modules/lifeops/factory/services/MemoryTypeServiceFactory.js";
import PriorityServiceFactory from "../../modules/lifeops/factory/services/PriorityServiceFactory.js";
import SourceServiceFactory from "../../modules/lifeops/factory/services/SourceServiceFactory.js";
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

    await seedIfEmpty(LifeAreaServiceFactory.instance, [
        {name: "Salud", description: "Bienestar fisico, mental y habitos saludables."},
        {name: "Trabajo", description: "Carrera, empleo, proyectos y responsabilidades profesionales."},
        {name: "Finanzas", description: "Ingresos, gastos, ahorro, inversion y patrimonio."},
        {name: "Familia", description: "Vinculos familiares, cuidado y responsabilidades del hogar."},
        {name: "Relaciones", description: "Amistades, pareja, red social y comunidad."},
        {name: "Crecimiento", description: "Aprendizaje, desarrollo personal y habilidades."},
        {name: "Hogar", description: "Casa, orden, mantenimiento y entorno cotidiano."},
        {name: "Ocio", description: "Descanso, hobbies, entretenimiento y disfrute personal."}
    ]);

    await seedIfEmpty(MemoryTypeServiceFactory.instance, [
        {name: "Idea", description: "Concepto o posibilidad para evaluar o desarrollar."},
        {name: "Decision", description: "Resolucion tomada que debe conservarse como referencia."},
        {name: "Aprendizaje", description: "Conocimiento adquirido a partir de una experiencia o investigacion."},
        {name: "Reflexion", description: "Observacion o analisis personal sobre un tema."},
        {name: "Preferencia", description: "Gusto, criterio o configuracion preferida por el usuario."}
    ]);

    await seedIfEmpty(PriorityServiceFactory.instance, [
        {name: "Baja", description: "Puede resolverse cuando haya disponibilidad.", color: "#22c55e"},
        {name: "Media", description: "Requiere seguimiento dentro del flujo normal.", color: "#eab308"},
        {name: "Alta", description: "Requiere atencion pronta.", color: "#f97316"},
        {name: "Critica", description: "Debe atenderse con maxima prioridad.", color: "#ef4444"}
    ]);

    await seedIfEmpty(SourceServiceFactory.instance, [
        {name: "Manual", description: "Tarea creada manualmente por el usuario."},
        {name: "Asistente", description: "Tarea creada por el asistente IA."},
        {name: "Email", description: "Tarea originada desde un correo."},
        {name: "Reunion", description: "Tarea surgida de una reunion."},
        {name: "Chat", description: "Tarea registrada desde una conversacion."},
        {name: "Sistema", description: "Tarea generada automaticamente por el sistema."}
    ]);

    await seedIfEmpty(TaskStatusServiceFactory.instance, [
        {name: "Pendiente", description: "La tarea aun no fue iniciada.", color: "#64748b"},
        {name: "En progreso", description: "La tarea esta siendo trabajada.", color: "#3b82f6"},
        {name: "En espera", description: "La tarea depende de otra accion o respuesta.", color: "#eab308"},
        {name: "Completada", description: "La tarea fue finalizada.", color: "#22c55e", completesTask: true},
        {name: "Archivada", description: "La tarea fue finalizada.", color: "#8b5cf6", archivesTask: true},
        {name: "Cancelada", description: "La tarea ya no corresponde realizarla.", color: "#ef4444"}
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
