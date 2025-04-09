package com.example.apzandroid.helpers.stations

import android.content.Context
import android.widget.ArrayAdapter
import android.widget.Spinner
import android.widget.Toast
import com.example.apzandroid.models.station_models.StationStatusResponse
import com.example.apzandroid.models.station_models.StationsResponse
import com.example.apzandroid.models.station_models.UpdateStationStatusRequest
import retrofit2.Call
import retrofit2.Response
import retrofit2.Callback

object StationHelper {

    fun loadStations(csrfToken: String, onSuccess: (List<StationsResponse>) -> Unit, onFailure: (String) -> Unit) {
        RetrofitClient.stationsService.stations(csrfToken).enqueue(object : Callback<List<StationsResponse>> {
            override fun onResponse(call: Call<List<StationsResponse>>, response: Response<List<StationsResponse>>) {
                if (response.isSuccessful) {
                    val stationsList = response.body() ?: emptyList()
                    onSuccess(stationsList)
                } else {
                    onFailure("Помилка завантаження станцій")
                }
            }

            override fun onFailure(call: Call<List<StationsResponse>>, t: Throwable) {
                onFailure("Помилка підключення: ${t.message}")
            }
        })
    }

    fun searchStations(csrfToken: String, keyword: String, onSuccess: (List<StationsResponse>) -> Unit, onFailure: (String) -> Unit) {
        RetrofitClient.stationsService.searchStations(keyword, csrfToken).enqueue(object : Callback<List<StationsResponse>> {
            override fun onResponse(call: Call<List<StationsResponse>>, response: Response<List<StationsResponse>>) {
                if (response.isSuccessful) {
                    val stationsList = response.body() ?: emptyList()
                    onSuccess(stationsList)
                } else {
                    onFailure("Помилка пошуку станцій")
                }
            }

            override fun onFailure(call: Call<List<StationsResponse>>, t: Throwable) {
                onFailure("Помилка підключення: ${t.message}")
            }
        })
    }

    fun fetchStationName(csrfToken: String, stationId: Int, onSuccess: (String) -> Unit, onFailure: (String) -> Unit) {
        RetrofitClient.stationsService.stationsId(csrfToken, stationId.toString()).enqueue(object : Callback<StationsResponse> {
            override fun onResponse(call: Call<StationsResponse>, response: Response<StationsResponse>) {
                if (response.isSuccessful) {
                    val stationName = response.body()?.station_of_containers_name ?: "Невідома станція"
                    onSuccess(stationName)
                } else {
                    onFailure("Помилка отримання станції")
                }
            }

            override fun onFailure(call: Call<StationsResponse>, t: Throwable) {
                onFailure("Помилка підключення: ${t.message}")
            }
        })
    }

    fun fetchStationStatus(csrfToken: String, statusStation: Int, callback: (String) -> Unit, errorCallback: (String) -> Unit) {
        RetrofitClient.stationsService.statusStations(statusStation.toString(), csrfToken).enqueue(object : Callback<StationStatusResponse> {
            override fun onResponse(call: Call<StationStatusResponse>, response: Response<StationStatusResponse>) {
                if (response.isSuccessful) {
                    val statusName = response.body()?.station_status_name ?: "Unknown"
                    callback(statusName)
                } else {
                    errorCallback("Помилка отримання статусу станції")
                }
            }

            override fun onFailure(call: Call<StationStatusResponse>, t: Throwable) {
                errorCallback("Немає підключення")
            }
        })
    }

    fun updateStationStatus(
        csrfToken: String,
        stationId: Int,
        selectedStatusId: Int,
        onSuccess: () -> Unit,
        onFailure: (String) -> Unit
    ) {
        val updateRequest = UpdateStationStatusRequest(selectedStatusId)

        RetrofitClient.stationsService.updateStationStatus(
            stationId.toString(),
            csrfToken,
            updateRequest
        ).enqueue(object : Callback<StationsResponse> {
            override fun onResponse(call: Call<StationsResponse>, response: Response<StationsResponse>) {
                if (response.isSuccessful) {
                    onSuccess()
                } else {
                    onFailure("Помилка при оновленні")
                }
            }

            override fun onFailure(call: Call<StationsResponse>, t: Throwable) {
                onFailure("Помилка: ${t.message}")
            }
        })
    }

    fun fetchStatuses(
        csrfToken: String,
        context: Context,
        spinner: Spinner,
        onStatusesLoaded: (List<StationStatusResponse>) -> Unit
    ) {
        RetrofitClient.stationsService.getStatusStations(csrfToken).enqueue(object : Callback<List<StationStatusResponse>> {
            override fun onResponse(call: Call<List<StationStatusResponse>>, response: Response<List<StationStatusResponse>>) {
                if (response.isSuccessful) {
                    val statuses = response.body() ?: emptyList()

                    val adapter = ArrayAdapter(context, android.R.layout.simple_spinner_item, statuses.map { it.station_status_name })
                    adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
                    spinner.adapter = adapter

                    onStatusesLoaded(statuses)
                } else {
                    Toast.makeText(context, "Не вдалося завантажити статуси", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<StationStatusResponse>>, t: Throwable) {
                Toast.makeText(context, "Помилка при завантаженні статусів: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }


}