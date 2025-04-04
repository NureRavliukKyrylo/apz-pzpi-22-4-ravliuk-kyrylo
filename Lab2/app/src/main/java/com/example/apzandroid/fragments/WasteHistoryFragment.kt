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
import com.example.apzandroid.models.station_models.StationsResponse
import com.example.apzandroid.models.waste_history_models.WasteHistoriesResponse
import com.example.apzandroid.utils.CsrfTokenManager
import com.google.android.material.datepicker.MaterialDatePicker
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.text.SimpleDateFormat
import java.util.*

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
            showDateRangePicker()
        }

        return view
    }

    private fun showDateRangePicker() {
        val datePicker =
            MaterialDatePicker.Builder.dateRangePicker()
                .setTitleText("Оберіть діапазон дат")
                .build()

        datePicker.show(parentFragmentManager, "DATE_PICKER")

        datePicker.addOnPositiveButtonClickListener { selection ->
            val startDate = formatDate(selection.first)
            val endDate = formatDate(selection.second)

            Log.d("WasteHistoryFragment", "Вибрано діапазон: $startDate - $endDate")

            loadWasteHistory(startDate, endDate)
        }
    }

    private fun formatDate(timestamp: Long?): String {
        return if (timestamp != null) {
            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            sdf.format(Date(timestamp))
        } else {
            ""
        }
    }

    private fun loadWasteHistory(startDate: String, endDate: String) {
        RetrofitClient.wasteHistoryService.wasteHistories(csrfToken)
            .enqueue(object : Callback<List<WasteHistoriesResponse>> {
                override fun onResponse(
                    call: Call<List<WasteHistoriesResponse>>,
                    response: Response<List<WasteHistoriesResponse>>
                ) {
                    if (response.isSuccessful) {
                        wasteHistoryList = response.body()?.filter {
                            it.recycling_date >= startDate && it.recycling_date <= endDate
                        } ?: listOf()

                        if (wasteHistoryList.isEmpty()) {
                            emptyTextView.visibility = View.VISIBLE
                            recyclerView.visibility = View.GONE
                            Log.d("WasteHistoryFragment", "Немає історії за вибраний період")
                        } else {
                            emptyTextView.visibility = View.GONE
                            recyclerView.visibility = View.VISIBLE
                            loadStationNames()
                        }
                    } else {
                        Log.e("WasteHistoryFragment", "Помилка завантаження даних: ${response.errorBody()?.string()}")
                    }
                }

                override fun onFailure(call: Call<List<WasteHistoriesResponse>>, t: Throwable) {
                    Log.e("WasteHistoryFragment", "Помилка завантаження історії: ${t.message}", t)
                }
            })
    }

    private fun loadStationNames() {
        wasteHistoryList.forEach { history ->
            if (!stationNames.containsKey(history.station_id)) {
                RetrofitClient.stationsService.stationsId(csrfToken, history.station_id.toString())
                    .enqueue(object : Callback<StationsResponse> {
                        override fun onResponse(call: Call<StationsResponse>, response: Response<StationsResponse>) {
                            if (response.isSuccessful) {
                                val stationName = response.body()?.station_of_containers_name ?: "Невідома станція"
                                stationNames[history.station_id] = stationName

                                Log.d("WasteHistoryFragment", "Завантажено станцію ID ${history.station_id}: $stationName")

                                updateRecyclerView()
                            } else {
                                Log.e("WasteHistoryFragment", "Помилка отримання станції ID ${history.station_id}: ${response.errorBody()?.string()}")
                            }
                        }

                        override fun onFailure(call: Call<StationsResponse>, t: Throwable) {
                            Log.e("WasteHistoryFragment", "Помилка завантаження станції ID ${history.station_id}: ${t.message}", t)
                        }
                    })
            }
        }
    }

    private fun updateRecyclerView() {
        recyclerView.adapter = WasteHistoryAdapter(wasteHistoryList, stationNames)
        Log.d("WasteHistoryFragment", "Оновлено RecyclerView з ${wasteHistoryList.size} записами")
    }
}

