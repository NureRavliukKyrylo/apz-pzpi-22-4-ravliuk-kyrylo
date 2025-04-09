package com.example.apzandroid.adapters

import android.app.AlertDialog
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.recyclerview.widget.RecyclerView
import com.example.apzandroid.R
import com.example.apzandroid.helpers.stations.StationHelper
import com.example.apzandroid.models.station_models.StationStatusResponse
import com.example.apzandroid.models.station_models.StationsResponse
import com.example.apzandroid.models.station_models.UpdateStationStatusRequest
import retrofit2.Call
import retrofit2.Response
import retrofit2.Callback

class OperatorPageStationAdapter(
    private var stations: List<StationsResponse>,
    private val csrfToken: String
) : RecyclerView.Adapter<OperatorPageStationAdapter.StationOperatorPageViewHolder>() {

    class StationOperatorPageViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val stationName: TextView = view.findViewById(R.id.stationNameOperator)
        val updateStationStatus: Button = view.findViewById(R.id.updateStationStatus)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): StationOperatorPageViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.stations_operator_item, parent, false)
        return StationOperatorPageViewHolder(view)
    }

    fun updateStations(newStations: List<StationsResponse>) {
        stations = newStations.sortedBy { it.id }
        notifyDataSetChanged()
    }

    fun updateStation(stationId: Int, newStatusId: Int) {
        stations = stations.map { station ->
            if (station.id == stationId) {
                station.copy(status_station = newStatusId)
            } else {
                station
            }
        }
        notifyDataSetChanged()
    }

    override fun onBindViewHolder(holder: StationOperatorPageViewHolder, position: Int) {
        val station = stations[position]
        holder.stationName.text = station.station_of_containers_name

        holder.updateStationStatus.setOnClickListener {
            showStatusDialog(holder.itemView.context, station.id, station.status_station)
        }
    }

    override fun getItemCount(): Int = stations.size

    private fun showStatusDialog(context: Context, stationId: Int, currentStatusId: Int) {
        val dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_update_status, null)
        val spinner = dialogView.findViewById<Spinner>(R.id.statusSpinner)
        val confirmButton = dialogView.findViewById<Button>(R.id.confirmUpdateButton)

        val alertDialog = AlertDialog.Builder(context)
            .setView(dialogView)
            .create()

        fetchStatuses(context, spinner, currentStatusId) { statuses ->
            val currentIndex = statuses.indexOfFirst { it.id == currentStatusId }
            if (currentIndex != -1) {
                spinner.setSelection(currentIndex)
            }

            confirmButton.setOnClickListener {
                val selectedIndex = spinner.selectedItemPosition
                val selectedStatusId = statuses[selectedIndex].id
                updateStationStatus(context, stationId, selectedStatusId, alertDialog)
            }

            alertDialog.show()
        }
    }

    private fun fetchStatuses(context: Context, spinner: Spinner, currentStatusId: Int, onStatusesLoaded: (List<StationStatusResponse>) -> Unit) {
        StationHelper.fetchStatuses(csrfToken, context, spinner) { statuses ->
            val currentIndex = statuses.indexOfFirst { it.id == currentStatusId }
            if (currentIndex != -1) {
                spinner.setSelection(currentIndex)
            }

            onStatusesLoaded(statuses)
        }
    }

    private fun updateStationStatus(context: Context, stationId: Int, selectedStatusId: Int, alertDialog: AlertDialog) {
        StationHelper.updateStationStatus(csrfToken, stationId, selectedStatusId,
            onSuccess = {
                updateStation(stationId, selectedStatusId)
                Toast.makeText(context, "Статус оновлено", Toast.LENGTH_SHORT).show()
                alertDialog.dismiss()
            },
            onFailure = { errorMessage ->
                Toast.makeText(context, errorMessage, Toast.LENGTH_SHORT).show()
            }
        )
    }
}
