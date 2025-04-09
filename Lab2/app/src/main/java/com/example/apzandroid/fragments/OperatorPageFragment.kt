package com.example.apzandroid.fragments

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.apzandroid.R
import com.example.apzandroid.adapters.OperatorPageStationAdapter
import com.example.apzandroid.helpers.stations.StationHelper
import com.example.apzandroid.helpers.reports.ReportHelper
import com.example.apzandroid.utils.CsrfTokenManager
import com.example.apzandroid.utils.DatePickerUtils

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

        fetchStations()

        val getStationsReportButton: Button = view.findViewById(R.id.getStationsReportButton)
        getStationsReportButton.setOnClickListener {
            DatePickerUtils.showDateRangePicker(requireContext(), parentFragmentManager) { start, end ->
                startDate = start
                endDate = end
                sendReportRequest()
            }
        }

        val getWasteReportButton: Button = view.findViewById(R.id.getWasteReportButton)
        getWasteReportButton.setOnClickListener {
            DatePickerUtils.showDateRangePicker(requireContext(), parentFragmentManager) { start, end ->
                startDate = start
                endDate = end
                sendWasteReportRequest()
            }
        }

        return view
    }

    private fun sendReportRequest() {
        if (startDate != null && endDate != null) {
            ReportHelper.sendReportRequest(requireContext(), csrfToken, startDate!!, endDate!!) { fileName ->
                Log.d("OperatorPageFragment", "$fileName generated successfully")
            }
        }
    }

    private fun sendWasteReportRequest() {
        if (startDate != null && endDate != null) {
            ReportHelper.sendWasteReportRequest(requireContext(), csrfToken, startDate!!, endDate!!) { fileName ->
                Log.d("OperatorPageFragment", "$fileName generated successfully")
            }
        }
    }

    private fun fetchStations() {
        Log.d("OperatorPageFragment", "Fetching stations...")

        StationHelper.loadStations(csrfToken, onSuccess = { stations ->
            Log.d("OperatorPageFragment", "Stations fetched: ${stations.size}")
            adapter.updateStations(stations)
        }, onFailure = { error ->
            Log.e("OperatorPageFragment", "Fetch stations error: $error")
        })
    }
}
