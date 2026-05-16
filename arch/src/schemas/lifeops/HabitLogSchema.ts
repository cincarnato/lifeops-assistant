import { IEntitySchema } from "@drax/arch";

const entitySchema: IEntitySchema = {
    module: "lifeops",
    name: "HabitLog",
    apiBasePath: "habit-logs",
    apiTag: "HabitLog",
    collectionName: "HabitLog",
    schema: {
        habit: {
            type: "ref",
            ref: "Habit",
            refDisplay: "name",
            required: true,
            header: true,
            index: true,
        },
        date: {
            type: "date",
            required: true,
            header: true,
            index: true,
        },
        task: {
            type: "ref",
            ref: "Task",
            refDisplay: "title",
            header: true,
            index: true,
        },
    },
};

export default entitySchema;
export { entitySchema };
