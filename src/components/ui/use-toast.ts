"use client"

// Lấy cảm hứng từ thư viện react-hot-toast
import * as React from "react"

import type {
    ToastActionElement,
    ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1 // Giới hạn số lượng toast hiển thị cùng lúc
const TOAST_REMOVE_DELAY = 1000 // Thời gian chờ trước khi xóa toast khỏi DOM (ms)

type ToasterToast = ToastProps & {
    id: string
    title?: React.ReactNode
    description?: React.ReactNode
    action?: ToastActionElement
}

let count = 0 // Biến đếm để tạo ID duy nhất cho toast

// Hàm tạo ID duy nhất
function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER
    return count.toString()
}

// Các loại hành động có thể xảy ra
type Action =
    | {
        type: "ADD_TOAST" // Thêm toast mới
        toast: ToasterToast
    }
    | {
        type: "UPDATE_TOAST" // Cập nhật toast hiện có
        toast: Partial<ToasterToast>
    }
    | {
        type: "DISMISS_TOAST" // Ẩn toast (có thể theo ID hoặc tất cả)
        toastId?: ToasterToast["id"]
    }
    | {
        type: "REMOVE_TOAST" // Xóa toast khỏi DOM (có thể theo ID hoặc tất cả)
        toastId?: ToasterToast["id"]
    }

// Trạng thái của store toast
interface State {
    toasts: ToasterToast[]
}

// Map để lưu trữ các timeout cho việc xóa toast
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// Hàm thêm toast vào hàng đợi xóa
const addToRemoveQueue = (toastId: string) => {
    if (toastTimeouts.has(toastId)) { // Nếu đã có timeout cho toast này, không làm gì cả
        return
    }

    // Đặt timeout để xóa toast sau một khoảng thời gian
    const timeout = setTimeout(() => {
        toastTimeouts.delete(toastId) // Xóa timeout khỏi map
        dispatch({ // Gửi hành động xóa toast
            type: "REMOVE_TOAST",
            toastId: toastId,
        })
    }, TOAST_REMOVE_DELAY)

    toastTimeouts.set(toastId, timeout) // Lưu timeout vào map
}

// Reducer để quản lý trạng thái toast
export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case "ADD_TOAST": // Thêm toast mới
            return {
                ...state,
                toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT), // Thêm vào đầu mảng và giới hạn số lượng
            }

        case "UPDATE_TOAST": // Cập nhật toast hiện có
            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === action.toast.id ? { ...t, ...action.toast } : t // Tìm và cập nhật toast theo ID
                ),
            }

        case "DISMISS_TOAST": { // Ẩn toast
            const { toastId } = action

            if (toastId) { // Nếu có ID, thêm vào hàng đợi xóa
                addToRemoveQueue(toastId)
            } else { // Nếu không có ID, ẩn tất cả toast
                state.toasts.forEach((toast) => {
                    addToRemoveQueue(toast.id)
                })
            }

            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === toastId || toastId === undefined // Nếu ID khớp hoặc không có ID (ẩn tất cả)
                        ? {
                            ...t,
                            open: false, // Đặt trạng thái open thành false
                        }
                        : t
                ),
            }
        }
        case "REMOVE_TOAST": // Xóa toast khỏi DOM
            if (action.toastId === undefined) { // Nếu không có ID, xóa tất cả
                return {
                    ...state,
                    toasts: [],
                }
            }
            return { // Nếu có ID, lọc ra toast cần xóa
                ...state,
                toasts: state.toasts.filter((t) => t.id !== action.toastId),
            }
    }
}

const listeners: Array<(state: State) => void> = [] // Mảng các listener để theo dõi thay đổi trạng thái

let memoryState: State = { toasts: [] } // Trạng thái toast được lưu trong bộ nhớ

// Hàm gửi hành động đến reducer
function dispatch(action: Action) {
    memoryState = reducer(memoryState, action) // Cập nhật trạng thái
    listeners.forEach((listener) => { // Thông báo cho tất cả listener
        listener(memoryState)
    })
}

type Toast = Omit<ToasterToast, "id"> // Kiểu Toast cho người dùng, không bao gồm ID

// Hàm hiển thị toast
function toast(props: Toast) {
    const id = genId() // Tạo ID duy nhất

    // Hàm cập nhật toast
    const update = (updateProps: ToasterToast) =>
        dispatch({
            type: "UPDATE_TOAST",
            toast: { ...updateProps, id },
        })
    // Hàm ẩn toast
    const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

    // Bỏ qua bất kỳ toast hiện có nào trước khi hiển thị toast mới, quan trọng đối với TOAST_LIMIT = 1
    dispatch({ type: "DISMISS_TOAST" });

    // Phân tách tường minh các thuộc tính đã biết và trải rộng phần còn lại
    const { title, description, action, variant, ...remainingToastProps } = props;

    const newToast: ToasterToast = {
        id,
        title,
        description,
        action,
        variant,
        open: true,
        onOpenChange: (open) => {
            if (!open) dismiss()
        },
        ...remainingToastProps, // Trải rộng bất kỳ ToastProps hợp lệ nào khác (như duration, v.v.)
    };

    dispatch({
        type: "ADD_TOAST",
        toast: newToast,
    })

    return {
        id: id,
        dismiss,
        update,
    }
}

// Hook để sử dụng toast trong component
function useToast() {
    const [state, setState] = React.useState<State>(memoryState) // Lấy trạng thái toast từ memoryState

    React.useEffect(() => {
        listeners.push(setState) // Thêm setState vào danh sách listener khi component mount
        return () => { // Xóa listener khi component unmount
            const index = listeners.indexOf(setState)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }, [state])

    return {
        ...state,
        toast, // Hàm hiển thị toast
        dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }), // Hàm ẩn toast
    }
}

export { useToast, toast }

