package com.example.apzandroid.helpers

import android.content.Context
import android.util.Log
import com.example.apzandroid.api.StationsService
import com.example.apzandroid.models.station_models.StationsResponse
import com.example.apzandroid.models.station_models.StationStatusResponse
import com.example.apzandroid.utils.CsrfTokenManager
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.MarkerOptions
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class StationManager(private val context: Context, private val stationsService: StationsService) {

    fun fetchStations(map: GoogleMap) {
        val csrfToken = CsrfTokenManager.getCsrfToken(context)
        stationsService.stations(csrfToken.toString()).enqueue(object : Callback<List<StationsResponse>> {
            override fun onResponse(call: Call<List<StationsResponse>>, response: Response<List<StationsResponse>>) {
                if (response.isSuccessful) {
                    response.body()?.forEach { station -> addMarker(map, station) }
                } else {
                    Log.e("StationManager", "Error fetching stations: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<List<StationsResponse>>, t: Throwable) {
                Log.e("StationManager", "Error: ${t.message}")
            }
        })
    }

    private fun addMarker(map: GoogleMap, station: StationsResponse) {
        val position = LatLng(station.latitude_location, station.longitude_location)
        val markerOptions = MarkerOptions().position(position).title(station.station_of_containers_name)
        val marker = map.addMarker(markerOptions)
        marker?.tag = station.status_station
    }

    fun handleMarkerClick(marker: Marker, map: GoogleMap, onRouteRequest: (LatLng) -> Unit) {
        val statusStation = marker.tag as? Int
        statusStation?.let { fetchStationStatus(it, marker) }
        onRouteRequest(marker.position)
    }

    private fun fetchStationStatus(statusStation: Int, marker: Marker) {
        val csrfToken = CsrfTokenManager.getCsrfToken(context)
        stationsService.statusStations(statusStation.toString(), csrfToken.toString()).enqueue(object : Callback<StationStatusResponse> {
            override fun onResponse(call: Call<StationStatusResponse>, response: Response<StationStatusResponse>) {
                if (response.isSuccessful) {
                    val status = response.body()?.station_status_name
                    marker.snippet = "Status: $status"
                    marker.showInfoWindow()
                }
            }

            override fun onFailure(call: Call<StationStatusResponse>, t: Throwable) {
                Log.e("StationManager", "Error fetching station status: ${t.message}")
            }
        })
    }


}

