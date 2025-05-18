package com.example.apzandroid.helpers.reports

import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.Toast
import androidx.core.content.FileProvider
import com.example.apzandroid.models.report_models.ReportDateRequest
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.File
import java.io.FileOutputStream

object ReportHelper {

    fun sendReportRequest(context: Context, csrfToken: String, startDate: String, endDate: String, onSuccess: (String) -> Unit) {
        val reportRequest = ReportDateRequest(start_date = startDate, end_date = endDate)

        RetrofitClient.reportService.getStationsReport(reportRequest, csrfToken)
            .enqueue(object : Callback<ResponseBody> {
                override fun onResponse(call: Call<ResponseBody>, response: Response<ResponseBody>) {
                    handleFileResponse(context, response, "stations_report.pdf", onSuccess)
                }

                override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                    Toast.makeText(context, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
                }
            })
    }

    fun sendWasteReportRequest(context: Context, csrfToken: String, startDate: String, endDate: String, onSuccess: (String) -> Unit) {
        val reportRequest = ReportDateRequest(start_date = startDate, end_date = endDate)

        RetrofitClient.reportService.getWasteReport(reportRequest, csrfToken)
            .enqueue(object : Callback<ResponseBody> {
                override fun onResponse(call: Call<ResponseBody>, response: Response<ResponseBody>) {
                    handleFileResponse(context, response, "waste_report.pdf", onSuccess)
                }

                override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                    Toast.makeText(context, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
                }
            })
    }

    private fun handleFileResponse(context: Context, response: Response<ResponseBody>, fileName: String, onSuccess: (String) -> Unit) {
        if (response.isSuccessful) {
            val file = response.body()
            if (file != null) {
                try {
                    val fileBytes = file.bytes()
                    val fileOutput = File(context.filesDir, fileName)
                    FileOutputStream(fileOutput).use {
                        it.write(fileBytes)
                    }

                    val intent = Intent(Intent.ACTION_VIEW)
                    val uri = FileProvider.getUriForFile(
                        context,
                        "com.example.apzandroid.fileprovider",
                        fileOutput
                    )
                    intent.setDataAndType(uri, "application/pdf")
                    intent.flags = Intent.FLAG_GRANT_READ_URI_PERMISSION
                    context.startActivity(intent)

                    Toast.makeText(context, "$fileName downloaded", Toast.LENGTH_SHORT).show()

                    onSuccess(fileName)
                } catch (e: Exception) {
                    Log.e("ReportError", "Error saving file: ${e.message}")
                    Toast.makeText(context, "Error saving file", Toast.LENGTH_SHORT).show()
                }
            }
        } else {
            Log.e("ReportError", "Response error: ${response.errorBody()?.string()}")
            Toast.makeText(context, "Failed to get report", Toast.LENGTH_SHORT).show()
        }
    }
}
