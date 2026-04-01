# Add project specific ProGuard rules here.

# ---- React Native ----
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.**

# ---- React Native New Architecture (TurboModules / Fabric) ----
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.fabric.** { *; }

# ---- Reanimated ----
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# ---- Gesture Handler ----
-keep class com.swmansion.gesturehandler.** { *; }

# ---- Async Storage ----
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# ---- Vector Icons ----
-keep class com.oblador.vectoricons.** { *; }

# ---- react-native-fs ----
-keep class com.rnfs.** { *; }

# ---- react-native-document-picker ----
-keep class io.github.elc1798.** { *; }
-keep class com.reactnativedocumentpicker.** { *; }

# ---- Skia ----
-keep class com.shopify.reactnative.skia.** { *; }
-dontwarn com.shopify.reactnative.skia.**

# ---- Clipboard ----
-keep class com.reactnativecommunity.clipboard.** { *; }

# ---- Keep JS interface annotations ----
-keepattributes *Annotation*
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ---- General Android ----
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception
-dontwarn sun.misc.**
-dontwarn java.lang.invoke.**
