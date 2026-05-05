package com.example.wildcatsden.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.wildcatsden.R
import com.example.wildcatsden.data.Venue

class VenueAdapter(
    private val onItemClick: (Int) -> Unit
) : RecyclerView.Adapter<VenueAdapter.VenueViewHolder>() {

    private var venues = listOf<Venue>()

    fun submitList(newList: List<Venue>) {
        venues = newList
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VenueViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_venue_card, parent, false)
        return VenueViewHolder(view)
    }

    override fun onBindViewHolder(holder: VenueViewHolder, position: Int) {
        holder.bind(venues[position])
    }

    override fun getItemCount(): Int = venues.size

    inner class VenueViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val venueImage: ImageView = itemView.findViewById(R.id.venueImage)
        private val venueTitle: TextView = itemView.findViewById(R.id.venueTitle)
        private val btnFavorite: ImageButton = itemView.findViewById(R.id.btnFavorite)

        fun bind(venue: Venue) {
            venueTitle.text = venue.venueName

            Glide.with(itemView.context)
                .load(venue.image)
                .placeholder(R.drawable.ic_placeholder)
                .into(venueImage)

            itemView.setOnClickListener {
                onItemClick(venue.venueId)
            }

            btnFavorite.setOnClickListener {
                // Handle favorite toggle
            }
        }
    }
}