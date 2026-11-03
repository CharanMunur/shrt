import mongoose, { Schema } from "mongoose";

interface ICounter {
  name: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model<ICounter>("Counter", CounterSchema);

export async function getNextSequence(name: string): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}
