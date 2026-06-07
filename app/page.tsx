"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, CheckCircle2, Home, Mail, Menu, ShieldCheck, Truck, UserRound, X } from "lucide-react";
import { createClient, User } from "@supabase/supabase-js";
// UnifiedBookingFormCore removed from this page to avoid rendering the embedded form on the Swedish homepage

const frames = [
  { counter: "01 / 06", kicker: "HE