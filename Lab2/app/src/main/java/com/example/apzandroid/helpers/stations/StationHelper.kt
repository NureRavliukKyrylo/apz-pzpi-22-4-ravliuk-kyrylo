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
                    onFailure("Failed to load stations")
                }
            }

            override fun onFailure(call: Call<List<StationsResponse>>, t: Throwable) {
                onFailure("Error: ${t.message}")
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
                    onFailure("Failed to search stations")
                }
            }

            override fun onFailure(call: Call<List<StationsResponse>>, t: Throwable) {
                onFailure("Error: ${t.message}")
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
                    onFailure("Failed to get station name")
                }
            }

            override fun onFailure(call: Call<StationsResponse>, t: Throwable) {
                onFailure("Error: ${t.message}")
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
                    errorCallback("Failed to get status station")
                }
            }

            override fun onFailure(call: Call<StationStatusResponse>, t: Throwable) {
                errorCallback("No connection")
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
                    onFailure("Failde to update")
                }
            }

            override fun onFailure(call: Call<StationsResponse>, t: Throwable) {
                onFailure("Error: ${t.message}")
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
                    Toast.makeText(context, "Failed to fetch statuses", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<StationStatusResponse>>, t: Throwable) {
                Toast.makeText(context, "Error fetching: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    fun loadFilteredStations(
        csrfToken: String,
        search: String?,
        statusId: Int?,
        onSuccess: (List<StationsResponse>) -> Unit,
        onError: (String) -> Unit
    ) {
        loadStations(csrfToken, { stations ->
            val filteredStations = stations.filter { station ->
                val matchesSearch = search.isNullOrBlank() ||
                        station.station_of_containers_name.contains(search, ignoreCase = true)
                val matchesStatus = statusId == null || station.status_station == statusId
                matchesSearch && matchesStatus
            }
            onSuccess(filteredStations)
        }, { error ->
            onError(error)
        })
    }



}