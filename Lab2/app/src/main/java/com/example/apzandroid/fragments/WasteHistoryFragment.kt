package com.example.apzandroid.fragments

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.apzandroid.R
import com.example.apzandroid.adapters.WasteHistoryAdapter
import com.example.apzandroid.helpers.stations.StationHelper
import com.example.apzandroid.helpers.waste_histories.WasteHistoryHelper
import com.example.apzandroid.models.waste_history_models.WasteHistoriesResponse
import com.example.apzandroid.utils.DatePickerUtils
import com.example.apzandroid.utils.CsrfTokenManager

class WasteHistoryFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var btnPickDate: Button
    private lateinit var emptyTextView: TextView
    private var wasteHistoryList: List<WasteHistoriesResponse> = listOf()
    private val stationNames = mutableMapOf<Int, String>()
    private var csrfToken: String = ""

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.waste_history_view, container, false)

        recyclerView = view.findViewById(R.id.wateHistoryRecycler)
        btnPickDate = view.findViewById(R.id.btnPickDate)
        emptyTextView = view.findViewById(R.id.emptyTextView)

        csrfToken = CsrfTokenManager.getCsrfToken(requireContext()).toString()

        recyclerView.layoutManager = LinearLayoutManager(requireContext())

        btnPickDate.setOnClickListener {
            DatePickerUtils.showDateRangePicker(
                requireContext(),
                parentFragmentManager
            ) { startDate, endDate ->
                Log.d("WasteHistoryFragment", "Обрано: $startDate — $endDate")
                loadWasteHistory(startDate, endDate)
            }
        }

        return view
    }

    private fun loadWasteHistory(startDate: String, endDate: String) {
        WasteHistoryHelper.loadWasteHistory(
            csrfToken,
            startDate,
            endDate,
            onSuccess = { filteredHistory ->
                wasteHistoryList = filteredHistory

                if (wasteHistoryList.isEmpty()) {
                    emptyTextView.visibility = View.VISIBLE
                    recyclerView.visibility = View.INVISIBLE
                    Log.d("WasteHistoryFragment", "Немає історії за вибраний період")
                } else {
                    emptyTextView.visibility = View.GONE
                    recyclerView.visibility = View.VISIBLE
                    loadStationNames()
                }
            },
            onFailure = { error ->
                Log.e("WasteHistoryFragment", error)
            }
        )
    }

    private fun loadStationNames() {
        wasteHistoryList.forEach { history ->
            if (!stationNames.containsKey(history.station_id)) {
                StationHelper.fetchStationName(csrfToken, history.station_id, { stationName ->
                    stationNames[history.station_id] = stationName
                    updateRecyclerView()
                }, { error ->
                    Log.e("WasteHistoryFragment", error)
                })
            }
        }
    }

    private fun updateRecyclerView() {
        recyclerView.adapter = WasteHistoryAdapter(wasteHistoryList, stationNames)
        Log.d("WasteHistoryFragment", "Оновлено RecyclerView з ${wasteHistoryList.size} записами")
    }
}
