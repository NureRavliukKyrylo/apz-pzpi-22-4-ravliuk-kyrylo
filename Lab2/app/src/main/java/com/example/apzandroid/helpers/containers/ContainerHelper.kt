package com.example.apzandroid.helpers.containers

import android.widget.Toast
import android.widget.LinearLayout
import android.view.LayoutInflater
import android.widget.TextView
import com.example.apzandroid.models.container_models.ContainersResponse
import com.example.apzandroid.models.container_models.StatusContainerResponse
import com.example.apzandroid.models.container_models.TypeContainerResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import com.example.apzandroid.R

object ContainerHelper {

    fun fetchContainerStatus(containerId: Int, csrfToken: String, callback: (String) -> Unit) {
        RetrofitClient.containersService.statusContainers(containerId.toString(), csrfToken)
            .enqueue(object : Callback<StatusContainerResponse> {
                override fun onResponse(call: Call<StatusContainerResponse>, response: Response<StatusContainerResponse>) {
                    if (response.isSuccessful) {
                        val statusName = response.body()?.status_name ?: "Unknown"
                        callback("Status: $statusName")
                    } else {
                        callback("Помилка статусу")
                    }
                }

                override fun onFailure(call: Call<StatusContainerResponse>, t: Throwable) {
                    callback("Помилка мережі")
                }
            })
    }

    fun fetchContainerType(containerId: Int, csrfToken: String, callback: (String) -> Unit) {
        RetrofitClient.containersService.typeContainers(containerId.toString(), csrfToken)
            .enqueue(object : Callback<TypeContainerResponse> {
                override fun onResponse(call: Call<TypeContainerResponse>, response: Response<TypeContainerResponse>) {
                    if (response.isSuccessful) {
                        val typeName = response.body()?.type_name_container ?: "Unknown"
                        callback("Type: $typeName")
                    } else {
                        callback("Помилка типу")
                    }
                }

                override fun onFailure(call: Call<TypeContainerResponse>, t: Throwable) {
                    callback("Помилка мережі")
                }
            })
    }

    fun loadContainersForStation(stationId: Int, csrfToken: String, containerBlock: LinearLayout) {
        RetrofitClient.containersService.containers(csrfToken).enqueue(object : Callback<List<ContainersResponse>> {
            override fun onResponse(call: Call<List<ContainersResponse>>, response: Response<List<ContainersResponse>>) {
                if (response.isSuccessful) {
                    val containers = response.body()?.filter { it.station_id == stationId } ?: emptyList()
                    addContainersToStation(containerBlock, containers, csrfToken)
                } else {
                    Toast.makeText(containerBlock.context, "Помилка завантаження контейнерів", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<ContainersResponse>>, t: Throwable) {
                Toast.makeText(containerBlock.context, "Помилка підключення", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun addContainersToStation(containerBlock: LinearLayout, containers: List<ContainersResponse>, csrfToken: String) {
        val context = containerBlock.context
        val inflater = LayoutInflater.from(context)

        for (container in containers) {
            val containerView = inflater.inflate(R.layout.container_item, containerBlock, false)

            val containerType: TextView = containerView.findViewById(R.id.containerType)
            val containerStatus: TextView = containerView.findViewById(R.id.containerStatus)
            val fillLevel: TextView = containerView.findViewById(R.id.fillLevel)

            fillLevel.text = "Fill: ${container.fill_level}%"

            fetchContainerStatus(container.status_container_id, csrfToken) { status ->
                containerStatus.text = status
            }

            fetchContainerType(container.type_of_container_id, csrfToken) { type ->
                containerType.text = type
            }

            containerBlock.addView(containerView)
            containerBlock.requestLayout()
        }
    }
}
