import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed", "Overdue"],
      default: "Not Started",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Low",
    },
    project: { type: String, default: "General" },
    startDate: { type: String, default: "" }, // kept as "YYYY-MM-DD" like the form
    dueDate: { type: String, default: "" },
    tags: { type: [String], default: ["General"] },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

export default mongoose.model("Task", taskSchema);