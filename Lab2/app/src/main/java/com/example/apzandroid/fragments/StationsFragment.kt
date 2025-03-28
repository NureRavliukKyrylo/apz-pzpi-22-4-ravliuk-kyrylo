package com.example.apzandroid.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.SearchView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.apzandroid.R
import com.example.apzandroid.adapters.StationAdapter
import com.example.apzandroid.models.station_models.StationsResponse
import com.example.apzandroid.utils.CsrfTokenManager
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class StationsFragment : Fragment() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: StationAdapter
    private lateinit var searchView: SearchView
    private var csrfToken: String = ""

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.stations_view, container, false)
        recyclerView = view.findViewById(R.id.recyclerStations)
        searchView = view.findViewById(R.id.searchViewStations)

        csrfToken = CsrfTokenManager.getCsrfToken(requireContext()).toString()
        recyclerView.layoutManager = LinearLayoutManager(context)

        val emptyList = emptyList<StationsResponse>()
        adapter = StationAdapter(emptyList, CsrfTokenManager.getCsrfToken(requireContext()).toString())
        recyclerView.adapter = adapter

        loadStations()

        setupSearchView()

        return view
    }

    private fun loadStations() {
        val csrfToken = CsrfTokenManager.getCsrfToken(requireContext())

        RetrofitClient.stationsService.stations(csrfToken.toString()).enqueue(object : Callback<List<StationsResponse>> {
            override fun onResponse(call: Call<List<StationsResponse>>, response: Response<List<StationsResponse>>) {
                if (response.isSuccessful) {
                    val stationsList = response.body() ?: emptyList()
                    adapter = StationAdapter(stationsList, csrfToken.toString())
                    recyclerView.adapter = adapter
                } else {
                    Toast.makeText(context, "Помилка завантаження станцій", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<StationsResponse>>, t: Throwable) {
                Toast.makeText(context, "Помилка підключення", Toast.LENGTH_SHORT).show()
            }
        })
    }
    private fun setupSearchView() {
        searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?): Boolean {
                if (!query.isNullOrEmpty()) {
                    searchStations(query)
                }
                return true
            }

            override fun onQueryTextChange(newText: String?): Boolean {
                if (newText.isNullOrEmpty()) {
                    loadStations()
                } else {
                    searchStations(newText)
                }
                return true
            }
        })
    }

    private fun searchStations(keyword: String) {
        RetrofitClient.stationsService.searchStations(keyword, csrfToken).enqueue(object : Callback<List<StationsResponse>> {
            override fun onResponse(call: Call<List<StationsResponse>>, response: Response<List<StationsResponse>>) {
                if (response.isSuccessful) {
                    val stationsList = response.body() ?: emptyList()
                    println(response.body())
                    adapter.updateData(stationsList)
                } else {
                    Toast.makeText(context, "Помилка пошуку", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<StationsResponse>>, t: Throwable) {
                Toast.makeText(context, "Помилка підключення", Toast.LENGTH_SHORT).show()
            }
        })
    }
}

