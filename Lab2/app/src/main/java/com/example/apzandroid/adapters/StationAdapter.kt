package com.example.apzandroid.adapters

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.recyclerview.widget.RecyclerView
import com.example.apzandroid.R
import com.example.apzandroid.models.container_models.ContainersResponse
import com.example.apzandroid.models.container_models.TypeContainerResponse
import com.example.apzandroid.models.container_models.StatusContainerResponse
import com.example.apzandroid.models.station_models.StationStatusResponse
import com.example.apzandroid.models.station_models.StationsResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import android.widget.ImageView;
import androidx.appcompat.app.AppCompatActivity
import com.example.apzandroid.fragments.MapFragment


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

        RetrofitClient.stationsService.statusStations(station.status_station.toString(), csrfToken)
            .enqueue(object : Callback<StationStatusResponse> {
                override fun onResponse(call: Call<StationStatusResponse>, response: Response<StationStatusResponse>) {
                    if (response.isSuccessful) {
                        holder.stationStatus.text = response.body()?.station_status_name ?: "Unknown"
                    } else {
                        holder.stationStatus.text = "Помилка"
                    }
                }

                override fun onFailure(call: Call<StationStatusResponse>, t: Throwable) {
                    holder.stationStatus.text = "Немає підключення"
                }
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

        loadContainersForStation(station.id, holder)
    }

    override fun getItemCount(): Int = stations.size

    private fun loadContainersForStation(stationId: Int, holder: StationViewHolder) {
        RetrofitClient.containersService.containers(csrfToken).enqueue(object : Callback<List<ContainersResponse>> {
            override fun onResponse(call: Call<List<ContainersResponse>>, response: Response<List<ContainersResponse>>) {
                if (response.isSuccessful) {
                    val containers = response.body()?.filter { it.station_id == stationId } ?: emptyList()
                    addContainersToStation(holder, containers)
                } else {
                    Toast.makeText(holder.itemView.context, "Помилка завантаження контейнерів", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<ContainersResponse>>, t: Throwable) {
                Toast.makeText(holder.itemView.context, "Помилка підключення", Toast.LENGTH_SHORT).show()
            }
        })
    }

    fun updateData(newStations: List<StationsResponse>) {
        stations = newStations
        notifyDataSetChanged()
    }

    private fun addContainersToStation(holder: StationViewHolder, containers: List<ContainersResponse>) {
        val context = holder.itemView.context
        val inflater = LayoutInflater.from(context)

        for (container in containers) {
            val containerView = inflater.inflate(R.layout.container_item, holder.containerBlock, false)

            val containerType: TextView = containerView.findViewById(R.id.containerType)
            val containerStatus: TextView = containerView.findViewById(R.id.containerStatus)
            val fillLevel: TextView = containerView.findViewById(R.id.fillLevel)

            fillLevel.text = "Fill: ${container.fill_level}%"

            RetrofitClient.containersService.statusContainers(container.status_container_id.toString(), csrfToken)
                .enqueue(object : Callback<StatusContainerResponse> {
                    override fun onResponse(call: Call<StatusContainerResponse>, response: Response<StatusContainerResponse>) {
                        if (response.isSuccessful) {
                            containerStatus.text = "Status: ${response.body()?.status_name ?: "Uknown"}"
                        } else {
                            containerStatus.text = "Помилка статусу"
                        }
                    }

                    override fun onFailure(call: Call<StatusContainerResponse>, t: Throwable) {
                        containerStatus.text = "Помилка мережі"
                    }
                })

            RetrofitClient.containersService.typeContainers(container.type_of_container_id.toString(), csrfToken)
                .enqueue(object : Callback<TypeContainerResponse> {
                    override fun onResponse(call: Call<TypeContainerResponse>, response: Response<TypeContainerResponse>) {
                        if (response.isSuccessful) {
                            containerType.text = "Type: ${response.body()?.type_name_container ?: "Uknown"}"
                        } else {
                            containerType.text = "Помилка типу"
                        }
                    }

                    override fun onFailure(call: Call<TypeContainerResponse>, t: Throwable) {
                        containerType.text = "Помилка мережі"
                    }
                })

            holder.containerBlock.addView(containerView)
            holder.containerBlock.requestLayout()
        }
    }

}

