import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  MouseEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

type Variant = "success" | "error" | "info" | "warning";

interface Note {
  id: string;
  message: ReactNode;
  variant: Variant;
  dismissible: boolean;
  timeout: number;
}

type Action =
  | { type: "ADD"; payload: Note }
  | { type: "REMOVE"; payload: { id: string } };

function notesReducer(state: Note[], action: Action): Note[] {
  switch (action.type) {
    case "ADD":
      return [...state, action.payload];
    case "REMOVE":
      return state.filter((n) => n.id !== action.payload.id);
    default:
      return state;
  }
}

interface Ctx {
  notify: (
    message: ReactNode,
    variant?: Variant,
    timeout?: number,
    dismissible?: boolean
  ) => void;
}

const NotificationContext = createContext<Ctx | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notes, dispatch] = useReducer(notesReducer, []);

  const notify: Ctx["notify"] = (
    message,
    variant = "info",
    timeout = 3_000,
    dismissible = true
  ) => {
    const id = crypto.randomUUID();
    dispatch({
      type: "ADD",
      payload: { id, message, variant, dismissible, timeout },
    });

    if (timeout > 0) {
      setTimeout(() => dispatch({ type: "REMOVE", payload: { id } }), timeout);
    }
  };

  const remove = (id: string) => dispatch({ type: "REMOVE", payload: { id } });

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <NotificationContainer notes={notes} onRemove={remove} />
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotify = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotify must be used inside <NotificationProvider>");
  return ctx.notify;
};

interface NotificationContainerProps {
  notes: Note[];
  onRemove: (id: string) => void;
}

export const NotificationContainer = ({
  notes,
  onRemove,
}: NotificationContainerProps) => (
  <div className="fixed inset-x-0 top-4 mx-auto flex w-fit flex-col gap-2 z-50">
    <AnimatePresence initial={false}>
      {notes.map((n) => (
        <NotificationBar key={n.id} {...n} onClose={() => onRemove(n.id)} />
      ))}
    </AnimatePresence>
  </div>
);

interface Props {
  message: ReactNode;
  variant: Variant;
  dismissible: boolean;
  onClose: (e: MouseEvent<HTMLButtonElement>) => void;
}

const styles: Record<Variant, string> = {
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-blue-600 text-white",
  warning: "bg-yellow-500 text-black dark:text-gray-900",
};

export const NotificationBar = ({
  message,
  variant,
  dismissible,
  onClose,
}: Props) => (
  <motion.div
    initial={{ y: -20, opacity: 0, scale: 0.95 }}
    animate={{ y: 0, opacity: 1, scale: 1 }}
    exit={{ y: -20, opacity: 0, scale: 0.95 }}
    transition={{ type: "spring", stiffness: 400, damping: 30 }}
    role="status"
    aria-live="polite"
    className={`relative flex items-start gap-2 rounded-lg px-4 py-2 shadow-lg shadow-black/10 ${styles[variant]}`}
  >
    <span className="flex-1">{message}</span>

    {dismissible && (
      <button
        aria-label="Close notification"
        onClick={onClose}
        className="ml-2 select-none text-xl leading-none opacity-80 transition hover:opacity-100"
      >
        ×
      </button>
    )}
  </motion.div>
);
