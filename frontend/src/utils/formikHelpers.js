import { toast } from "react-toastify"

export const showFormikErrorsAsToast = (errors) => {
    if (!errors || typeof errors !== 'object') return

    const errorMessages = []

    const extractErrors = (obj) => {
        Object.values(obj).forEach((value) => {
            if (typeof value === 'string') {
                errorMessages.push(value)
            } else if (typeof value === 'object') {
                extractErrors(value)
            }
        })
    }

    extractErrors(errors)

    if (errorMessages.length > 0) {
        toast.error(errorMessages[0])
    }
}
