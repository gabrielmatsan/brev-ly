import { createId } from "@paralleldrive/cuid2";

type idType = "cuid" | "alphanumeric";

export function generateId(type: idType) {
  switch (type) {
    case "cuid":
      return createId();
    case "alphanumeric": {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      return Array.from({ length: 6 }, () => characters[Math.floor(Math.random() * characters.length)]).join("");
    }
  }
}