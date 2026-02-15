package com.example.donationbox.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.example.donationbox.databinding.FragmentDonationBinding

import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import androidx.core.graphics.createBitmap
import androidx.core.graphics.set

class DonationFragment : Fragment() {

    private var _binding: FragmentDonationBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDonationBinding.inflate(inflater, container, false)
        return binding.root
    }

    private val cameraExecutor = java.util.concurrent.Executors.newSingleThreadExecutor()

    private val requestPermissionLauncher =
        registerForActivityResult(androidx.activity.result.contract.ActivityResultContracts.RequestPermission()) { isGranted: Boolean ->
            if (isGranted) {
                startCamera()
            } else {
                android.widget.Toast.makeText(context, getString(com.example.donationbox.R.string.camera_permission_required), android.widget.Toast.LENGTH_SHORT).show()
            }
        }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        if (androidx.core.content.ContextCompat.checkSelfPermission(
                requireContext(),
                android.Manifest.permission.CAMERA
            ) == android.content.pm.PackageManager.PERMISSION_GRANTED
        ) {
            startCamera()
        } else {
            requestPermissionLauncher.launch(android.Manifest.permission.CAMERA)
        }
        
        // Generate QR Code
        val upiString = "upi://pay?pa=charity@upi&pn=DigitalDonationBox&mc=0000&tid=1234567890&tr=1234567890&tn=Donation&am=0&cu=INR"
        try {
            val barcodeEncoder = com.google.zxing.MultiFormatWriter()
            val bitMatrix = barcodeEncoder.encode(upiString, com.google.zxing.BarcodeFormat.QR_CODE, 400, 400)
            val width = bitMatrix.width
            val height = bitMatrix.height
            val bmp = androidx.core.graphics.createBitmap(width, height, android.graphics.Bitmap.Config.RGB_565)
            for (x in 0 until width) {
                for (y in 0 until height) {
                    bmp[x, y] = if (bitMatrix[x, y]) android.graphics.Color.BLACK else android.graphics.Color.WHITE
                }
            }
            binding.ivQrCode.setImageBitmap(bmp)
        } catch (e: Exception) {
            e.printStackTrace()
        }
        
        binding.fabAdmin.setOnClickListener {
            parentFragmentManager.beginTransaction()
                .replace(com.example.donationbox.R.id.fragment_container, AdminLoginFragment())
                .addToBackStack(null)
                .commit()
        }
        
        // Long press to set Server IP
        binding.fabAdmin.setOnLongClickListener {
            showIpDialog()
            true
        }
    }

    private var lastDetectedValue: String? = null
    private var stableFrameCount = 0
    private var isRecorded = false

    private var serverIp = "192.168.1.X" // Default, will be updated by Dialog

    private fun saveDonation(amountStr: String) {
        val amount = amountStr.replace(Regex("[^0-9.]"), "").toDoubleOrNull() ?: 0.0
        val timestamp = System.currentTimeMillis()
        
        // 1. Save Local
        val donation = com.example.donationbox.data.DonationEntity(
            amount = amount,
            currency = "INR",
            type = "Cash",
            timestamp = timestamp
        )
        
        val db = com.example.donationbox.data.AppDatabase.getDatabase(requireContext())
        val dao = db.donationDao()
        
        viewLifecycleOwner.lifecycleScope.launch {
            dao.insert(donation)
        }

        // 2. Send to Server (Network)
        sendToServer(amount, timestamp)
    }

    private fun sendToServer(amount: Double, timestamp: Long) {
        val retrofit = com.example.donationbox.network.RetrofitClient.getClient("http://$serverIp:3000/")

        val api = retrofit.create(com.example.donationbox.network.DonationApi::class.java)
        val request = com.example.donationbox.network.DonationRequest(amount, "INR", "Cash", timestamp)

        api.sendDonation(request).enqueue(object : retrofit2.Callback<Void> {
            override fun onResponse(call: retrofit2.Call<Void>, response: retrofit2.Response<Void>) {
                android.util.Log.d("DonationFragment", "Sent to server: ${response.code()}")
            }
            override fun onFailure(call: retrofit2.Call<Void>, t: Throwable) {
                android.util.Log.e("DonationFragment", "Failed to send to server (Is Laptop Connected?)", t)
                android.widget.Toast.makeText(context, "Server Error: ${t.message}", android.widget.Toast.LENGTH_LONG).show()
            }
        })
    }

    private var heartbeatJob: kotlinx.coroutines.Job? = null

    private fun startHeartbeat() {
        heartbeatJob?.cancel()
        heartbeatJob = viewLifecycleOwner.lifecycleScope.launch {
            while (true) {
                if (serverIp != "192.168.1.X") {
                    try {
                        val retrofit = com.example.donationbox.network.RetrofitClient.getClient("http://$serverIp:3000/")
                        val api = retrofit.create(com.example.donationbox.network.DonationApi::class.java)
                        api.sendHeartbeat().enqueue(object : retrofit2.Callback<Void> {
                            override fun onResponse(call: retrofit2.Call<Void>, response: retrofit2.Response<Void>) {}
                            override fun onFailure(call: retrofit2.Call<Void>, t: Throwable) {}
                        })
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
                kotlinx.coroutines.delay(5000) // Pulse every 5 seconds
            }
        }
    }

    private fun showIpDialog() {
        val input = android.widget.EditText(context)
        input.hint = "192.168.1.X"
        input.setText(serverIp)

        android.app.AlertDialog.Builder(context)
            .setTitle(getString(com.example.donationbox.R.string.connect_to_pc))
            .setMessage(getString(com.example.donationbox.R.string.enter_pc_ip))
            .setView(input)
            .setPositiveButton(getString(com.example.donationbox.R.string.connect)) { _, _ ->
                serverIp = input.text.toString()
                startHeartbeat() // Start pulse
                android.widget.Toast.makeText(context, getString(com.example.donationbox.R.string.connected_to, serverIp), android.widget.Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton(getString(com.example.donationbox.R.string.cancel), null)
            .show()
    }

    private fun startCamera() {
        val cameraProviderFuture = androidx.camera.lifecycle.ProcessCameraProvider.getInstance(requireContext())

        cameraProviderFuture.addListener({
            val cameraProvider: androidx.camera.lifecycle.ProcessCameraProvider = cameraProviderFuture.get()

            // High-Resolution Strategy for OCR clarity
            val resolutionSelector = androidx.camera.core.resolutionselector.ResolutionSelector.Builder()
                .setResolutionStrategy(androidx.camera.core.resolutionselector.ResolutionStrategy.HIGHEST_AVAILABLE_STRATEGY)
                .build()

            val preview = androidx.camera.core.Preview.Builder()
                .setResolutionSelector(resolutionSelector)
                .build()
                .also {
                    it.setSurfaceProvider(binding.viewFinder.surfaceProvider)
                }

            val imageAnalyzer = androidx.camera.core.ImageAnalysis.Builder()
                .setResolutionSelector(resolutionSelector)
                .setBackpressureStrategy(androidx.camera.core.ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()
                .also {
                    it.setAnalyzer(cameraExecutor, com.example.donationbox.vision.CurrencyAnalyzer { result, isReal ->
                        activity?.runOnUiThread {
                            if (isReal) {
                                binding.detectionOverlay.setBackgroundResource(com.example.donationbox.R.drawable.rounded_border)
                                
                                // Auto-Recording Logic
                                if (result == lastDetectedValue) {
                                    stableFrameCount++
                                } else {
                                    stableFrameCount = 0
                                    lastDetectedValue = result
                                    isRecorded = false
                                }

                                binding.tvInstruction.text = getString(com.example.donationbox.R.string.detected_result, result, stableFrameCount)

                                if (stableFrameCount > 3 && !isRecorded) {
                                    // Auto-Save
                                    saveDonation(result)
                                    isRecorded = true
                                    android.widget.Toast.makeText(context, getString(com.example.donationbox.R.string.saved_result, result), android.widget.Toast.LENGTH_SHORT).show()
                                    // Visual Feedback
                                    binding.detectionOverlay.setBackgroundResource(com.example.donationbox.R.drawable.rounded_border_success)
                                    binding.detectionOverlay.postDelayed({
                                        binding.detectionOverlay.setBackgroundResource(com.example.donationbox.R.drawable.rounded_border)
                                    }, 500)
                                }
                            } else {
                                // Neutral states (No note / Dark) -> Default Border
                                if (result == "Place Note" || result == "Too Dark") {
                                    binding.detectionOverlay.setBackgroundResource(com.example.donationbox.R.drawable.rounded_border)
                                } else {
                                    // Unknown object -> Red Border (Transparent center)
                                    binding.detectionOverlay.setBackgroundResource(com.example.donationbox.R.drawable.rounded_border_error)
                                }
                                
                                stableFrameCount = 0
                                lastDetectedValue = null
                                isRecorded = false
                                binding.tvInstruction.text = result
                            }
                        }
                    })
                }

            val cameraSelector = androidx.camera.core.CameraSelector.DEFAULT_BACK_CAMERA

            try {
                cameraProvider.unbindAll()
                val camera = cameraProvider.bindToLifecycle(
                    this, cameraSelector, preview, imageAnalyzer
                )
                
                // Ensure Continuous Auto-Focus is active
                val cameraControl = camera.cameraControl
                val factory = binding.viewFinder.meteringPointFactory
                val point = factory.createPoint(binding.viewFinder.width / 2f, binding.viewFinder.height / 2f)
                val action = androidx.camera.core.FocusMeteringAction.Builder(point, androidx.camera.core.FocusMeteringAction.FLAG_AF)
                    .setAutoCancelDuration(5, java.util.concurrent.TimeUnit.SECONDS)
                    .build()
                cameraControl.startFocusAndMetering(action)
                
            } catch (exc: Exception) {
                android.util.Log.e("DonationFragment", "Use case binding failed", exc)
            }

        }, androidx.core.content.ContextCompat.getMainExecutor(requireContext()))
    }

    override fun onDestroyView() {
        super.onDestroyView()
        heartbeatJob?.cancel()
        cameraExecutor.shutdown()
        _binding = null
    }
}
