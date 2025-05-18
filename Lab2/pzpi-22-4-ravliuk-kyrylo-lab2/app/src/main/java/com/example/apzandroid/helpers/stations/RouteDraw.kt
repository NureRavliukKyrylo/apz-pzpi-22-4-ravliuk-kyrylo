package com.example.apzandroid.helpers.stations

import android.Manifest
import android.content.Intent
import android.net.Uri
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.fragment.app.Fragment
import com.example.apzandroid.utils.RouteUtil
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.model.LatLng

class RouteDraw(private val fragment: Fragment, private val fusedLocationClient: FusedLocationProviderClient) {

    fun drawRouteToStation(map: GoogleMap, destination: LatLng) {
        val context = fragment.requireContext()

        if (!RouteUtil.checkLocationPermission(context)) {
            Log.w("MapFragment", "Location permission NOT granted. Requesting permission...")
            ActivityCompat.requestPermissions(
                fragment.requireActivity(),
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
                1001
            )
            return
        }

        fusedLocationClient.lastLocation.addOnSuccessListener { location ->
            location?.let {
                val origin = "${location.latitude},${location.longitude}"
                val dest = "${destination.latitude},${destination.longitude}"

                val gmmIntentUri = Uri.parse("google.navigation:q=$dest&origin=$origin&mode=d")
                val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri)
                mapIntent.setPackage("com.google.android.apps.maps")

                if (mapIntent.resolveActivity(context.packageManager) != null) {
                    context.startActivity(mapIntent)
                } else {
                    Log.e("RouteDraw", "Google Maps is not installed on this device.")
                }
            }
        }
    }
}