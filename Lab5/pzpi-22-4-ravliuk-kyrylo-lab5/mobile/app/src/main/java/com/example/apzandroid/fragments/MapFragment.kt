package com.example.apzandroid.fragments

import android.Manifest
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.fragment.app.Fragment
import com.example.apzandroid.R
import com.example.apzandroid.api.StationsService
import com.example.apzandroid.helpers.stations.RouteDraw
import com.example.apzandroid.helpers.stations.StationsMap
import com.example.apzandroid.utils.RouteUtil
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
    private lateinit var stationManager: StationsMap
    private lateinit var routeDrawer: RouteDraw
    private var selectedDestination: LatLng? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        val view = inflater.inflate(R.layout.interactive_map_view, container, false)

        mapView = view.findViewById(R.id.mapView)
        mapView.onCreate(savedInstanceState)
        mapView.getMapAsync(this)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(requireActivity())
        stationsService = RetrofitClient.stationsService

        stationManager = StationsMap(requireContext(), stationsService)
        routeDrawer = RouteDraw(this, fusedLocationClient)

        return view
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val getRouteBtn: Button = view.findViewById(R.id.btnGetRoute)

        getRouteBtn.setOnClickListener {
            selectedDestination?.let {
                routeDrawer.drawRouteToStation(mMap, it)
            } ?: run {
                Toast.makeText(requireContext(), "Please select a station first", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onMapReady(googleMap: GoogleMap) {
        mMap = googleMap
        stationManager.fetchStations(mMap)

        if (RouteUtil.checkLocationPermission(requireContext())) {
            mMap.isMyLocationEnabled = true
        }

        arguments?.let {
            val latitude = it.getDouble("LATITUDE", 0.0)
            val longitude = it.getDouble("LONGITUDE", 0.0)

            if (latitude != 0.0 && longitude != 0.0) {
                val stationLatLng = LatLng(latitude, longitude)
                mMap.animateCamera(CameraUpdateFactory.newLatLngZoom(stationLatLng, 13f), 1000, null)

            } else {
                showUserLocation()
            }
        } ?: showUserLocation()

        mMap.setOnMarkerClickListener { marker ->
            stationManager.handleMarkerClick(marker, mMap) { destination ->
                selectedDestination = destination
            }
            true
        }
    }

    private fun showUserLocation() {
        if (!RouteUtil.checkLocationPermission(requireContext())) {
            ActivityCompat.requestPermissions(
                requireActivity(),
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
                1001
            )
            return
        }

        fusedLocationClient.lastLocation.addOnSuccessListener { location ->
            location?.let {
                val userLatLng = LatLng(it.latitude, it.longitude)

                mMap.animateCamera(CameraUpdateFactory.newLatLngZoom(userLatLng, 13f), 1000, null)
            }
        }
    }



    override fun onResume() { super.onResume(); mapView.onResume() }
    override fun onPause() { super.onPause(); mapView.onPause() }
    override fun onDestroy() { super.onDestroy(); mapView.onDestroy() }
    override fun onLowMemory() { super.onLowMemory(); mapView.onLowMemory() }
}