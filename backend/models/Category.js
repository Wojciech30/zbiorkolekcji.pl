import mongoose from "mongoose";

const attributeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Nazwa atrybutu jest wymagana"],
        minlength: [2, "Nazwa atrybutu musi mieć przynajmniej 2 znaki"],
        maxlength: [50, "Nazwa atrybutu nie może być dłuższa niż 50 znaków"]
    },
    type: {
        type: String,
        enum: ["text", "number", "date", "boolean", "url", "select"],
        required: [true, "Typ atrybutu jest wymagany"]
    },
    required: {
        type: Boolean,
        default: false
    },
    options: {
        type: [String],
        validate: {
            validator: function(v) {
                return this.type === "select" ? v.length > 0 : true;
            },
            message: "Typ 'select' wymaga podania opcji"
        }
    }
});

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Nazwa kategorii jest wymagana"],
        unique: true,
        minlength: [2, "Nazwa kategorii musi mieć przynajmniej 2 znaki"],
        maxlength: [50, "Nazwa kategorii nie może być dłuższa niż 50 znaków"]
    },
    description: {
        type: String,
        maxlength: [500, "Opis nie może być dłuższy niż 500 znaków"]
    },
    attributes: [attributeSchema]
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret.__v;
            return ret;
        }
    }
});

categorySchema.path("attributes").validate(function(attributes) {
    const names = attributes.map(attr => attr.name.toLowerCase());
    return new Set(names).size === names.length;
}, "Atrybuty w kategorii muszą mieć unikalne nazwy");

export default mongoose.model("Category", categorySchema);