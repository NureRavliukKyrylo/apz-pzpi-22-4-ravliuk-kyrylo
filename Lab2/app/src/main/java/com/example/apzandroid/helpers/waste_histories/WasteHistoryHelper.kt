package com.example.apzandroid.helpers.waste_histories

import android.util.Log
import com.example.apzandroid.helpers.stations.StationHelper
import com.example.apzandroid.models.waste_history_models.WasteHistoriesResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

object WasteHistoryHelper {

    fun loadWasteHistory(
        csrfToken: String,
        startDate: String,
        endDate: String,
        onSuccess: (List<WasteHistoriesResponse>) -> Unit,
        onFailure: (String) -> Unit
    ) {
        RetrofitClient.wasteHistoryService.wasteHistories(csrfToken)
            .enqueue(object : Callback<List<WasteHistoriesResponse>> {
                override fun onResponse(
                    call: Call<List<WasteHistoriesResponse>>,
                    response: Response<List<WasteHistoriesResponse>>
                ) {
                    if (response.isSuccessful) {
                        val filteredHistory = response.body()?.filter {
                            it.recycling_date >= startDate && it.recycling_date <= endDate
                        } ?: listOf()

                        onSuccess(filteredHistory)
                    } else {
                        onFailure("Помилка завантаження даних: ${response.errorBody()?.string()}")
                    }
                }

                override fun onFailure(call: Call<List<WasteHistoriesResponse>>, t: Throwable) {
                    onFailure("Помилка завантаження історії: ${t.message}")
                }
            })
    }
}
