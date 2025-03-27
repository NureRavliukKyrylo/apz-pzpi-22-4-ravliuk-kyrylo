package com.example.apzandroid.fragments

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.Toast
import android.widget.Button
import androidx.fragment.app.Fragment
import com.example.apzandroid.R
import com.example.apzandroid.models.account_models.ChangePasswordRequest
import com.example.apzandroid.models.account_models.ChangePasswordResponse
import com.example.apzandroid.models.account_models.MySelfResponse
import com.example.apzandroid.models.account_models.UpdateCustomerRequest
import com.example.apzandroid.models.account_models.UpdateCustomerResponse
import com.example.apzandroid.utils.CsrfTokenManager
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class SettingsProfileFragment : Fragment() {

    private lateinit var usernameEditText: EditText
    private lateinit var emailEditText: EditText
    private lateinit var updateButton: Button
    private lateinit var oldPasswordEditText: EditText
    private lateinit var newPasswordEditText: EditText
    private lateinit var changePasswordButton: Button

    private var userId: String = ""

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.settings_profile, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        usernameEditText = view.findViewById(R.id.editUsernameSettings)
        emailEditText = view.findViewById(R.id.editEmailSettings)
        updateButton = view.findViewById(R.id.saveUserInfoButtonSettings)
        oldPasswordEditText = view.findViewById(R.id.oldPasswordEditTextSettings)
        newPasswordEditText = view.findViewById(R.id.newPasswordEditTextSettings)
        changePasswordButton = view.findViewById(R.id.changePasswordButton)

        getUserProfile()

        updateButton.setOnClickListener {
            updateUser()
        }

        changePasswordButton.setOnClickListener {
            changePassword()
        }
    }

    private fun getUserProfile() {
        RetrofitClient.accountService.myself().enqueue(object : Callback<MySelfResponse> {
            override fun onResponse(call: Call<MySelfResponse>, response: Response<MySelfResponse>) {
                if (response.isSuccessful) {
                    val userProfile = response.body()

                    if (userProfile != null) {
                        usernameEditText.setText(userProfile.username.toString())
                        emailEditText.setText(userProfile.email.toString())

                        userId = userProfile.id
                    }
                } else {
                    handleError("Error: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<MySelfResponse>, t: Throwable) {
                handleError("Failed to load user profile: ${t.localizedMessage}")
            }
        })
    }

    private fun updateUser() {
        val name = usernameEditText.text.toString()
        val email = emailEditText.text.toString()

        if (name.isEmpty() || email.isEmpty()) {
            Toast.makeText(requireContext(), "Заповніть всі поля", Toast.LENGTH_SHORT).show()
            return
        }

        val updateRequest = UpdateCustomerRequest(name, email)

        val csrfToken = CsrfTokenManager.getCsrfToken(requireContext())

        if (csrfToken == null) {
            Toast.makeText(requireContext(), "CSRF token не знайдений", Toast.LENGTH_SHORT).show()
            return
        }

        RetrofitClient.accountService.updateUser(
            userId,
            updateRequest,
            csrfToken
        ).enqueue(object : Callback<UpdateCustomerResponse> {
            override fun onResponse(call: Call<UpdateCustomerResponse>, response: Response<UpdateCustomerResponse>) {
                Log.d("API_RESPONSE", "HTTP Code: ${response.code()}")
                if (response.isSuccessful) {
                    val updateResponse = response.body()
                    Log.d("API_RESPONSE", "Response Body: $updateResponse")
                    activity?.supportFragmentManager?.popBackStack()

                    if (updateResponse != null) {
                        Toast.makeText(requireContext(), "Дані оновлено", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(requireContext(), "Помилка оновлення", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    val errorBody = response.errorBody()?.string()
                    Log.e("API_ERROR", "Error Body: $errorBody")
                    Toast.makeText(requireContext(), "Помилка оновлення", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<UpdateCustomerResponse>, t: Throwable) {
                Log.e("API_FAILURE", "Request failed: ${t.localizedMessage}")
                Toast.makeText(requireContext(), "Помилка підключення", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun changePassword() {
        val oldPassword = oldPasswordEditText.text.toString()
        val newPassword = newPasswordEditText.text.toString()

        if (oldPassword.isEmpty() || newPassword.isEmpty()) {
            Toast.makeText(requireContext(), "Заповніть всі поля", Toast.LENGTH_SHORT).show()
            return
        }

        val changePasswordRequest = ChangePasswordRequest(oldPassword, newPassword)
        val csrfToken = CsrfTokenManager.getCsrfToken(requireContext())

        if (csrfToken == null) {
            Toast.makeText(requireContext(), "CSRF token не знайдений", Toast.LENGTH_SHORT).show()
            return
        }

        RetrofitClient.accountService.changePassword(
            userId,
            changePasswordRequest,
            csrfToken
        ).enqueue(object : Callback<ChangePasswordResponse> {
            override fun onResponse(call: Call<ChangePasswordResponse>, response: Response<ChangePasswordResponse>) {
                if (response.isSuccessful) {
                    Toast.makeText(requireContext(), "Пароль успішно змінено", Toast.LENGTH_SHORT).show()
                    activity?.supportFragmentManager?.popBackStack()
                } else {
                    Toast.makeText(requireContext(), "Помилка зміни пароля", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<ChangePasswordResponse>, t: Throwable) {
                Toast.makeText(requireContext(), "Помилка підключення", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun handleError(message: String) {
        Toast.makeText(requireContext(), message, Toast.LENGTH_LONG).show()
        println(message)
    }
}
