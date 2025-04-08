package com.example.apzandroid.fragments

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Toast
import androidx.core.content.FileProvider
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.apzandroid.R
import com.example.apzandroid.adapters.OperatorPageStationAdapter
import com.example.apzandroid.models.report_models.ReportDateRequest
import com.example.apzandroid.models.station_models.StationsResponse
import com.example.apzandroid.utils.CsrfTokenManager
import com.google.android.material.datepicker.MaterialDatePicker
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

class OperatorPageFragment : Fragment() {
    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: OperatorPageStationAdapter
    private var csrfToken: String = ""
    private var startDate: String? = null
    private var endDate: String? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.operator_page, container, false)
        recyclerView = view.findViewById(R.id.recyclerViewOperatorPage)

        csrfToken = CsrfTokenManager.getCsrfToken(requireContext()).toString()
        recyclerView.layoutManager = LinearLayoutManager(context)
        adapter = OperatorPageStationAdapter(mutableListOf(), csrfToken)
        recyclerView.adapter = adapter

        // Завантаження станцій
        fetchStations()

        // Кнопка звіту по станціях
        val getStationsReportButton: Button = view.findViewById(R.id.getStationsReportButton)
        getStationsReportButton.setOnClickListener {
            showDateRangePicker { start, end ->
                startDate = start
                endDate = end
                sendReportRequest()
            }
        }

        // Кнопка звіту по відходах
        val getWasteReportButton: Button = view.findViewById(R.id.getWasteReportButton)
        getWasteReportButton.setOnClickListener {
            showDateRangePicker { start, end ->
                startDate = start
                endDate = end
                sendWasteReportRequest()
            }
        }

        return view
    }

    private fun showDateRangePicker(onDatesSelected: (String, String) -> Unit) {
        val picker = MaterialDatePicker.Builder.dateRangePicker()
            .setTitleText("Оберіть діапазон дат")
            .build()

        picker.show(parentFragmentManager, "DATE_RANGE_PICKER")

        picker.addOnPositiveButtonClickListener { selection ->
            val startMillis = selection.first
            val endMillis = selection.second

            val formatter = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val start = formatter.format(Date(startMillis))
            val end = formatter.format(Date(endMillis))

            Toast.makeText(context, "Обрано: $start — $end", Toast.LENGTH_SHORT).show()
            onDatesSelected(start, end)
        }
    }

    private fun sendReportRequest() {
        if (startDate != null && endDate != null) {
            val reportRequest = ReportDateRequest(start_date = startDate!!, end_date = endDate!!)

            RetrofitClient.reportService.getStationsReport(reportRequest, csrfToken)
                .enqueue(object : Callback<ResponseBody> {
                    override fun onResponse(call: Call<ResponseBody>, response: Response<ResponseBody>) {
                        handleFileResponse(response, "stations_report.pdf")
                    }

                    override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                        Toast.makeText(context, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
                    }
                })
        }
    }

    private fun sendWasteReportRequest() {
        if (startDate != null && endDate != null) {
            val reportRequest = ReportDateRequest(start_date = startDate!!, end_date = endDate!!)

            RetrofitClient.reportService.getWasteReport(reportRequest, csrfToken)
                .enqueue(object : Callback<ResponseBody> {
                    override fun onResponse(call: Call<ResponseBody>, response: Response<ResponseBody>) {
                        handleFileResponse(response, "waste_report.pdf")
                    }

                    override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                        Toast.makeText(context, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
                    }
                })
        }
    }

    private fun handleFileResponse(response: Response<ResponseBody>, fileName: String) {
        if (response.isSuccessful) {
            val file = response.body()
            if (file != null) {
                try {
                    val fileBytes = file.bytes()
                    val fileOutput = File(context?.filesDir, fileName)
                    FileOutputStream(fileOutput).use {
                        it.write(fileBytes)
                    }

                    val intent = Intent(Intent.ACTION_VIEW)
                    val uri = FileProvider.getUriForFile(
                        requireContext(),
                        "com.example.apzandroid.fileprovider",
                        fileOutput
                    )
                    intent.setDataAndType(uri, "application/pdf")
                    intent.flags = Intent.FLAG_GRANT_READ_URI_PERMISSION
                    startActivity(intent)

                    Toast.makeText(context, "$fileName downloaded", Toast.LENGTH_SHORT).show()
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

    private fun fetchStations() {
        Log.d("OperatorPageFragment", "Fetching stations...")

        RetrofitClient.stationsService.stations(csrfToken).enqueue(object : Callback<List<StationsResponse>> {
            override fun onResponse(
                call: Call<List<StationsResponse>>,
                response: Response<List<StationsResponse>>
            ) {
                if (response.isSuccessful) {
                    val stations = response.body() ?: emptyList()
                    Log.d("OperatorPageFragment", "Stations fetched: ${stations.size}")
                    adapter.updateStations(stations)
                } else {
                    Log.e("OperatorPageFragment", "Failed response: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<List<StationsResponse>>, t: Throwable) {
                Log.e("OperatorPageFragment", "Fetch error", t)
            }
        })
    }
}
