
import {
    createContext,
    useContext,
    useState,
    useEffect
} from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [toast, setToast] = useState(null);

    // Add notification to notification history
    function addNotification(title, message, type = "success") {
        const newNotification = {
            id: crypto.randomUUID(),
            title,
            message,
            type,
            read: false,
            createdAt: new Date().toISOString()
        };

        setNotifications(previous => [
            newNotification,
            ...previous
        ]);

        // Display sliding popup
        setToast({
            id: newNotification.id,
            title,
            message,
            type
        });
    }

    // Automatically close toast after 4 seconds
    useEffect(() => {
        if (!toast) return;

        const timeout = setTimeout(() => {
            setToast(null);
        }, 4000);

        return () => clearTimeout(timeout);
    }, [toast]);

    function closeToast() {
        setToast(null);
    }

    function markAsRead(id) {
        setNotifications(previous =>
            previous.map(notification =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        );
    }

    function markAllAsRead() {
        setNotifications(previous =>
            previous.map(notification => ({
                ...notification,
                read: true
            }))
        );
    }

    function deleteNotification(id) {
        setNotifications(previous =>
            previous.filter(notification =>
                notification.id !== id
            )
        );
    }

    const unreadCount = notifications.filter(
        notification => !notification.read
    ).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                toast,
                addNotification,
                closeToast,
                markAsRead,
                markAllAsRead,
                deleteNotification
            }}
        >
            {children}

            {toast && (
                <div className={`toastNotification ${toast.type}`}>
                    <div className="toastIcon">
                        {toast.type === "success" ? "✓" :
                         toast.type === "error" ? "✕" : "i"}
                    </div>

                    <div className="toastContent">
                        <h4>{toast.title}</h4>
                        <p>{toast.message}</p>
                    </div>

                    <button
                        type="button"
                        onClick={closeToast}
                        aria-label="Close notification"
                    >
                        ×
                    </button>
                </div>
            )}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error(
            "useNotifications must be used inside NotificationProvider"
        );
    }

    return context;
}
