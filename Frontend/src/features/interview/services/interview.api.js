import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
})

/**
 * @description Service to generate interview report based on user self description, resume and job description
 */
export async function generateInterviewReport({jobDescription, selfDescription, resumeFile}) {

    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)
    formData.append("resume", resumeFile)

    try {
        const response = await api.post("/api/interview", formData, {
            headers: {
                "Content-type": "multipart/form-data"
            }
        })

        return response.data

    } catch (err) {

        console.log(err)
    }
}

/**
 * @description Service to get interview report by interviewId
 */
export async function getInterviewReportById(interviewId) {

    try {
        const response = await api.get(`/api/interview/report/${interviewId}`)

        return response.data

    } catch (err) {

        console.log(err)
    }
}

/**
 * @description Service to get all interview reports of logged-in user
 */
export async function getAllInterviewReports() {

    try {

        const response = await api.get("/api/interview/")

        return response.data

    } catch (err) {

        console.log(err)
    }
}

/**
 * @description Service to generate resume pdf based on user self description, resume content and job description
 */
export async function generateResumePdf({interviewReportId}) {

    try {

        const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
            responseType: "blob"
        })

        return response.data
    } catch (err) {

        console.log(err)
    }

}

