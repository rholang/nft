import { createStore, createEvent } from 'effector';

export const event = createEvent<number>();
export const store = createStore('none').on(event, (_, e) => e.toString());
