import {
    generateInterviewReport,
    generateResumePdf,
    getAllInterviewReports,
    getInterviewReportById
} from "../services/interview.api.js"
import {useContext, useEffect} from "react"
import {InterviewContext} from "../interview.context.jsx";
import {useParams} from "react-router";

export const useInterview = () => {

    const context = useContext(InterviewContext)
    const {interviewId} = useParams();

    if (!context) {
        throw new Error("useInterview must be used within an interviewProvider")
    }

    const {loading, setLoading, report, setReport, reports, setReports} = context

    const generateReport = async ({jobDescription, selfDescription, resumeFile}) => {

        setLoading(true)
        let response

        try {
            response = await generateInterviewReport({jobDescription, selfDescription, resumeFile})
            setReport(response.interviewReport)

            return response.interviewReport
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }

        return response.interviewReport
    }

    const getReportById = async (InterviewId) => {

        setLoading(true)
        let response

        try {
            response = await getInterviewReportById(InterviewId)
            setReport(response.interviewReport)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }

        return response.interviewReport
    }

    const getReports = async () => {

        setLoading(true)
        let response

        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }

        return response.interviewReports
    }

    const getResumePdf = async (interviewReportId) => {

        setLoading(true)
        let response

        try {

            response = await generateResumePdf({interviewReportId})
            const url = window.URL.createObjectURL(new Blob([response], {type: "application/pdf"}))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [interviewId]);

    return ({loading, report, reports, generateReport, getReportById, getReports, getResumePdf})

}