package com.example.apzandroid.adapters

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.apzandroid.R
import com.example.apzandroid.models.station_models.StationsResponse
import android.widget.ImageView;
import androidx.appcompat.app.AppCompatActivity
import com.example.apzandroid.fragments.MapFragment
import com.example.apzandroid.helpers.containers.ContainerHelper
import com.example.apzandroid.helpers.stations.StationHelper


class StationAdapter(
    private var stations: List<StationsResponse>,
    private val csrfToken: String
) : RecyclerView.Adapter<StationAdapter.StationViewHolder>() {

    class StationViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val stationName: TextView = view.findViewById(R.id.stationType)
        val stationStatus: TextView = view.findViewById(R.id.stationStatus)
        val containerBlock: LinearLayout = view.findViewById(R.id.containersLayout)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): StationViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.stations_item, parent, false)
        return StationViewHolder(view)
    }

    override fun onBindViewHolder(holder: StationViewHolder, position: Int) {
        val station = stations[position]
        holder.stationName.text = station.station_of_containers_name

        StationHelper.fetchStationStatus(csrfToken, station.status_station, { statusName ->
            holder.stationStatus.text = statusName
        }, { error ->
            holder.stationStatus.text = error
        })

        holder.itemView.findViewById<ImageView>(R.id.goToMapClick).setOnClickListener {
            val stationLatitude = station.latitude_location
            val stationLongitude = station.longitude_location

            val bundle = Bundle().apply {
                putDouble("LATITUDE", stationLatitude)
                putDouble("LONGITUDE", stationLongitude)
            }

            val mapFragment = MapFragment().apply {
                arguments = bundle
            }

            val fragmentManager = (holder.itemView.context as AppCompatActivity).supportFragmentManager
            fragmentManager.beginTransaction()
                .replace(R.id.fragment_container, mapFragment)
                .addToBackStack(null)
                .commit()
        }

        holder.containerBlock.removeAllViews()

        ContainerHelper.loadContainersForStation(station.id, csrfToken, holder.containerBlock)
    }

    override fun getItemCount(): Int = stations.size

    fun updateData(newStations: List<StationsResponse>) {
        stations = newStations
        notifyDataSetChanged()
    }
}

