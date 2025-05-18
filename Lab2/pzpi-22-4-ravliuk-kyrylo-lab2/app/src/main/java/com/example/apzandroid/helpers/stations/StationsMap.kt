package com.example.apzandroid.helpers.stations

import android.content.Context
import android.util.Log
import com.example.apzandroid.api.StationsService
import com.example.apzandroid.models.station_models.StationsResponse
import com.example.apzandroid.utils.CsrfTokenManager
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.MarkerOptions

class StationsMap(private val context: Context, private val stationsService: StationsService) {

    fun fetchStations(map: GoogleMap) {
        val csrfToken = CsrfTokenManager.getCsrfToken(context)

        StationHelper.loadStations(csrfToken.toString(), { stations ->
            stations.forEach { station ->
                addMarker(map, station)
            }
        }, { errorMessage ->
            Log.e("StationManager", errorMessage)
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
        statusStation?.let { fetchStationStatus(marker, it) }
        onRouteRequest(marker.position)
    }

    private fun fetchStationStatus(marker: Marker, stationId: Int) {
        val csrfToken = CsrfTokenManager.getCsrfToken(context)

        StationHelper.fetchStationStatus(csrfToken.toString(), stationId, { status ->
            marker.snippet = status
            marker.showInfoWindow()
        }, { error ->
            marker.snippet = error
            marker.showInfoWindow()
        })
    }
}