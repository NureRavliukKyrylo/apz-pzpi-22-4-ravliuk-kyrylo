package com.example.apzandroid.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.example.apzandroid.R
import com.example.apzandroid.api.StationsService
import com.example.apzandroid.helpers.RouteDraw
import com.example.apzandroid.helpers.StationManager
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.MapView
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.model.LatLng

class MapFragment : Fragment(), OnMapReadyCallback {

    private lateinit var mapView: MapView
    private lateinit var mMap: GoogleMap
    private lateinit var stationsService: StationsService
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var stationManager: StationManager
    private lateinit var routeDrawer: RouteDraw

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        val view = inflater.inflate(R.layout.interactive_map_view, container, false)

        mapView = view.findViewById(R.id.mapView)
        mapView.onCreate(savedInstanceState)
        mapView.getMapAsync(this)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(requireActivity())
        stationsService = RetrofitClient.stationsService

        stationManager = StationManager(requireContext(), stationsService)
        routeDrawer = RouteDraw(this, fusedLocationClient)

        return view
    }

    override fun onMapReady(googleMap: GoogleMap) {
        mMap = googleMap
        stationManager.fetchStations(mMap)

        arguments?.let {
            val latitude = it.getDouble("LATITUDE", 0.0)
            val longitude = it.getDouble("LONGITUDE", 0.0)

            if (latitude != 0.0 && longitude != 0.0) {
                mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(LatLng(latitude, longitude), 13f))
            }
        }

        mMap.setOnMarkerClickListener { marker ->
            stationManager.handleMarkerClick(marker, mMap) { destination ->
                routeDrawer.drawRouteToStation(mMap, destination)
            }
            true
        }
    }

    override fun onResume() { super.onResume(); mapView.onResume() }
    override fun onPause() { super.onPause(); mapView.onPause() }
    override fun onDestroy() { super.onDestroy(); mapView.onDestroy() }
    override fun onLowMemory() { super.onLowMemory(); mapView.onLowMemory() }
}